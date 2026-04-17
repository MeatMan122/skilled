param(
  [string]$Destination = "$HOME\.agents\skills"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$source = Join-Path $repoRoot "plugins\shared-skills\skills"

if (-not (Test-Path -LiteralPath $source)) {
  throw "Skill source directory not found: $source"
}

New-Item -ItemType Directory -Force -Path $Destination | Out-Null

Get-ChildItem -LiteralPath $source -Directory | ForEach-Object {
  $target = Join-Path $Destination $_.Name
  if (Test-Path -LiteralPath $target) {
    Remove-Item -LiteralPath $target -Recurse -Force
  }
  Copy-Item -LiteralPath $_.FullName -Destination $target -Recurse -Force
  Write-Host "Installed $($_.Name) to $target"
}

Write-Host "Done. Restart Codex if newly installed skills do not appear."
