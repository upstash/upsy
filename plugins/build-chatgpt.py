#!/usr/bin/env python3
"""Validate Upsy's submission metadata and build a ZIP from an explicit file list."""

import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parent.parent
PACKAGE = ROOT / "plugins" / "chatgpt"
FILES = (
    "plugin.json",
    "mcp.json",
    "assets/icon.svg",
    "assets/icon-dark.svg",
    "skills/use-upsy/SKILL.md",
    "skills/use-upsy/agents/openai.yaml",
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def https_url(value):
    parsed = urlsplit(value)
    return parsed.scheme == "https" and bool(parsed.hostname) and not parsed.username and not parsed.password


def validate():
    manifest = json.loads((PACKAGE / "plugin.json").read_text())
    mcp = json.loads((PACKAGE / "mcp.json").read_text())
    require(manifest["$schema"] == "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json", "Use the portable plugin schema")
    require(re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", manifest["name"]) and len(manifest["name"]) <= 64, "Invalid package name")
    require(re.fullmatch(r"\d+\.\d+\.\d+", manifest["version"]), "Use a semantic release version")
    extension = manifest["extensions"]["com.openai"]
    interface = extension["interface"]
    for key, limit in {"displayName": 30, "shortDescription": 30, "longDescription": 4000, "developerName": 80}.items():
        value = interface[key]
        require(isinstance(value, str) and value.strip() and len(value) <= limit, f"Invalid {key}")
        if key != "longDescription":
            require("\n" not in value and "\r" not in value, f"{key} must be one line")
    require(interface["category"] == "Productivity", "Unexpected category")
    for key in ("websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"):
        require(https_url(interface[key]) and len(interface[key]) <= 1024, f"Invalid {key}")
    capabilities = interface["capabilities"]
    require(len(capabilities) <= 20 and all(x.strip() and len(x) <= 120 and "\n" not in x for x in capabilities), "Invalid capability labels")
    prompts = interface["defaultPrompt"]
    normalized = {" ".join(x.casefold().split()) for x in prompts}
    require(0 < len(prompts) <= 3 and len(normalized) == len(prompts), "Provide at most three distinct starter prompts")
    require(all(x.strip() and len(x) <= 128 and "\n" not in x and "@" not in x for x in prompts), "Invalid starter prompt")
    for key in ("composerIcon", "composerIconDark", "logo", "logoDark"):
        path = interface[key]
        require(path.startswith("./") and ".." not in Path(path).parts and path[2:] in FILES, f"Asset not included: {path}")
        file = PACKAGE / path[2:]
        require(not file.is_symlink() and file.stat().st_size <= 5 * 1024 * 1024, "Invalid asset")
        svg = ElementTree.parse(file).getroot()
        box = [float(x) for x in svg.attrib["viewBox"].split()]
        require(box[2] == box[3] and box[2] >= 48, "Icons must be square and at least 48 pixels")
    cases = extension["review"]["test_cases"]
    require(len(cases["positive"]) == 5 and len(cases["negative"]) == 3, "Provide exactly five positive and three negative cases")
    for case in cases["positive"] + cases["negative"]:
        for key in ("description", "prompt", "tools_triggered", "expected_behavior"):
            require(isinstance(case[key], str) and bool(case[key].strip()), f"Missing test field: {key}")
    require(https_url(extension["review"]["demo_recording_url"]), "Invalid video URL")
    require(extension["publication"]["release_notes"].strip(), "Missing release notes")
    require(mcp["$schema"] == "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json", "Use the portable MCP schema")
    require(mcp["mcpServers"] == {"upsy": {"type": "streamable-http", "url": "https://upsy.ai/connect"}}, "Unexpected MCP configuration")
    require("apps" not in extension and "hooks" not in extension, "Public submission cannot include app references or hooks")
    for filename in FILES:
        file = PACKAGE / filename
        require(file.is_file() and not file.is_symlink(), f"Missing regular file: {filename}")
        body = file.read_text()
        require(not re.search(r'(?i)(test_credentials|reviewer_instructions|client_secret|access_token|refresh_token|authorization\s*:|sk_[A-Za-z0-9_-]{20,}|-----BEGIN .*PRIVATE KEY)', body), f"Credential-like data in {filename}")
    return manifest


def main():
    manifest = validate()
    output = ROOT / "dist" / f"upsy-{manifest['version']}.zip"
    output.parent.mkdir(exist_ok=True)
    with ZipFile(output, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for filename in FILES:
            info = ZipInfo(filename, date_time=(2026, 9, 30, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, (PACKAGE / filename).read_bytes())
    with ZipFile(output) as archive:
        require(archive.testzip() is None and tuple(archive.namelist()) == FILES, "ZIP integrity check failed")
    print(json.dumps({"zip": str(output), "bytes": output.stat().st_size, "sha256": hashlib.sha256(output.read_bytes()).hexdigest(), "files": list(FILES), "positive_cases": 5, "negative_cases": 3}, indent=2))
    print("Local checks passed. Portal validation, identity, domain verification, authenticated review tests, and video coverage still need verification.")


if __name__ == "__main__":
    main()
