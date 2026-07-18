$file = 'c:\Users\varun\Documents\stuff\Coding\Antigravity-Github\ScratchPad\src\config\blogData.ts'
$slugs = @(
    'game-phys-convex',
    'game-phys-convex-hull',
    'game-phys-concave',
    'game-phys-convex-dec',
    'game-phys-sweep',
    'game-phys-dbvt',
    'game-phys-bvh',
    'game-gfx-ray-tracing',
    'game-gfx-rasterization',
    'game-gfx-pipeline',
    'game-gfx-sampling',
    'game-gfx-shader',
    'game-gfx-rendering-eq',
    'game-gfx-mapping',
    'game-gfx-reflection'
)

$content = Get-Content $file -Raw

foreach ($slug in $slugs) {
    $slugExists = $content -match ('"slug": "' + [regex]::Escape($slug) + '"')
    
    $imageName = $slug + '-dark.jpg'
    $imageExists = $content -match [regex]::Escape('/images/game-dev/' + $imageName)
    
    # Get the exact position of this slug
    $slugPos = [regex]::Match($content, '"slug": "' + [regex]::Escape($slug) + '"').Index
    
    $hasFaqsInMarkdown = $false
    $faqCount = 0
    
    if ($slugPos -gt 0) {
        # Find the NEXT slug after this one to bound the chunk
        $afterSlug = $content.Substring($slugPos + 50)
        $nextSlugMatch = [regex]::Match($afterSlug, '"slug": "game-')
        
        if ($nextSlugMatch.Success) {
            $chunkLen = $nextSlugMatch.Index + 50
        } else {
            $chunkLen = [Math]::Min(50000, $afterSlug.Length)
        }
        
        $chunk = $afterSlug.Substring(0, $chunkLen)
        
        # Check for FAQ section in markdown (Q1, Q2, etc. or "Conceptual Check")
        $hasFaqsInMarkdown = $chunk -match 'Conceptual Check'
        
        # Count number of questions (look for "Q1:", "Q2:", etc. or "**Q1" pattern)
        $matches = [regex]::Matches($chunk, '\*\*Q\d+')
        $faqCount = $matches.Count
        
        # Also check "**Q1:**" or "Q1:" patterns
        if ($faqCount -eq 0) {
            $matches2 = [regex]::Matches($chunk, '\\*\\*Q\d+')
            $faqCount = $matches2.Count
        }
    }
    
    $slugMark = if ($slugExists) { 'YES' } else { 'NO' }
    $imgMark = if ($imageExists) { 'YES' } else { 'NO' }
    $faqSectionMark = if ($hasFaqsInMarkdown) { 'YES' } else { 'NO' }
    
    Write-Host "$slug | Slug:$slugMark | Image:$imgMark | FAQ-Section:$faqSectionMark | Q-Count:$faqCount"
}
