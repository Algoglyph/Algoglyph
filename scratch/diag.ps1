$content = Get-Content 'src\config\blogData.ts' -Raw
$slugPos = [regex]::Match($content, '"slug": "game-phys-convex-dec"').Index
$chunk = $content.Substring($slugPos, 15000)
Write-Host "Has Conceptual: $(if ($chunk -match 'Conceptual') { 'YES' } else { 'NO' })"
Write-Host "Has Q1: $(if ($chunk -match 'Q1:') { 'YES' } else { 'NO' })"
$tailChunk = $chunk.Substring(12000, 1000)
Write-Host $tailChunk
