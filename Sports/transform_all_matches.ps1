# Transform all T20 match cards to professional format
# This script converts all remaining match cards from old inline format to new team vs team layout

$file = "c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI\Sports\T20-World-Cup.html"
$fileContent = Get-Content $file -Raw -Encoding UTF8

# Function to create match card HTML
function Get-MatchCardHTML {
    param(
        [string]$MatchNum,
        [string]$Stage,
        [string]$Time,
        [string]$Team1,
        [string]$Flag1,
        [string]$Team2,
        [string]$Flag2,
        [string]$Venue
    )
    
    $baseUrl = "https://images.icc-cricket.com/image/upload/t_q-good/prd/assets/flags"
    
    return @"
                <article class="match-card analysis-card">
                    <div class="match-header">
                        <span class="match-info">Match $MatchNum • $Stage</span>
                        <span class="match-time">$Time</span>
                    </div>
                    
                    <div class="match-teams">
                        <div class="team team-home">
                            <img src="$baseUrl/$Flag1.png" 
                                 alt="$Team1" class="team-flag">
                            <span class="team-name">$Team1</span>
                        </div>
                        
                        <span class="vs-divider">vs</span>
                        
                        <div class="team team-away">
                            <span class="team-name">$Team2</span>
                            <img src="$baseUrl/$Flag2.png" 
                                 alt="$Team2" class="team-flag">
                        </div>
                    </div>
                    
                    <div class="match-venue">
                        <span class="venue-icon">📍</span>
                        <span>$Venue</span>
                    </div>
                </article>
"@
}

Write-Host "Starting match card transformation..."
Write-Host "Total transformations needed: 55 match cards"
Write-Host "This will convert old format to professional team vs team layout"
Write-Host ""

# Count of transformations
$count = 0

# Use regex pattern to find and replace match cards
# Pattern matches: <article class="analysis-card"> through </article>
$pattern = '(?s)<article class="analysis-card">\s*<span class="category">Match (\d+) • ([^<]+)</span>\s*<h3>([^<]+?)\s*<img\s+src="[^"]+/([a-z]+)\.png"[^>]+>\s*vs\s*([^<]+?)\s*<img\s+src="[^"]+/([a-z]+)\.png"[^>]+>\s*</h3>\s*<p[^>]*>\s*([^<]+)<br>\s*([^<]+)\s*</p>\s*</article>'

# Replace each match with new format
$fileContent = [regex]::Replace($fileContent, $pattern, {
        param($match)
        $count++
    
        $matchNum = $match.Groups[1].Value
        $stage = $match.Groups[2].Value
        $team1 = $match.Groups[3].Value.Trim()
        $flag1 = $match.Groups[4].Value
        $team2 = $match.Groups[5].Value.Trim()
        $flag2 = $match.Groups[6].Value
        $venue = $match.Groups[7].Value.Trim()
        $time = $match.Groups[8].Value.Trim()
    
        Write-Host "[$count] Match $matchNum : $team1 vs $team2"
    
        return (Get-MatchCardHTML -MatchNum $matchNum -Stage $stage -Time $time `
                -Team1 $team1 -Flag1 $flag1 -Team2 $team2 -Flag2 $flag2 -Venue $venue)
    })

# Save the transformed content
Set-Content $file $fileContent -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "✓ Transformation complete!"
Write-Host "✓ Converted $count match cards to professional format"
Write-Host "✓ File saved: $file"
