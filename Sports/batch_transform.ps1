# Comprehensive batch transformation script for all remaining T20 match cards
# This file will be executed to transform old format cards to new professional layout

$file = "c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI\Sports\T20-World-Cup.html"
$content = Get-Content $file -Raw -Encoding UTF8

Write-Host "Starting batch transformation..."
Write-Host "File: $file"
Write-Host ""

# Function to perform a single replacement
function Replace-Match {
    param([string]$Old, [string]$New)
    
    if ($script:content -match [regex]::Escape($Old)) {
        $script:content = $script:content.Replace($Old, $New)
        return $true
    }
    return $false
}

# Track transformations
$count = 0

# Since manual transformation of 31+ cards is tedious,  
# let's use a simpler approach: Find-and-replace the structure
# We'll replace the h3 structure pattern

# Pattern 1: Transform the header and time
$script:content = $script:content -replace '<article class="analysis-card">\s*<span class="category">(Match \d+ • [^<]+)</span>', '<article class="match-card analysis-card"><div class="match-header"><span class="match-info">$1</span>'

# Since time is at the end, we need to handle this differently
# Let's do a multi-step approach

Write-Host "Performing transformation in steps..."

# Step 1: Add match-card class to all remaining analysis-card articles with Match category
$before = ([regex]::Matches($content, 'class="match-card')).Count
$content = $content -replace '(<article class="analysis-card">)\s*(<span class="category">Match \d+)', '<article class="match-card analysis-card">$2'
$after = ([regex]::Matches($content, 'class="match-card')).Count
$step1Count = $after - $before
Write-Host "Step 1 ✓ Added match-card class to $step1Count articles"

# Save intermediate result
Set-Content $file $content -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "Transformation complete! Use manual edits for detailed structure."
Write-Host "Next: Use multi_replace_file_content tool to transform individual match cards"
