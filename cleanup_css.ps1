
$path = "c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI\style.css"
$content = Get-Content -Raw $path

# The redundant block looked like this (approx):
#     to {
#         opacity: 1;
#         transform: translateY(0);
#     }
# }
# 
# .main-nav ul {
#     display: flex;
#     gap: var(--space-xl);
# }
# 
# .main-nav a {

# Regex to match this mess (allowing for flexible whitespace)
# We handle the 'to { ... } }' block specifically.
$badCss = "to\s*\{\s*opacity:\s*1;\s*transform:\s*translateY\(0\);\s*\}\s*\}\s*\.main-nav\s*ul\s*\{\s*display:\s*flex;\s*gap:\s*var\(--space-xl\);\s*\}\s*\.main-nav\s*a\s*\{"

# However, since previous attempt failed to match, let's target the UNIQUE weirdness: "to { opacity: 1; transform: translateY(0); } }"
# This is inside the file floating around.
# Let's just remove lines 569-585 (approx) if we can locate them by content context.

# Let's try to match the EXACT string from Step 997 output if possible.
# Better strategy: Read file line by line and remove the range? No, file content changed.
# Let's use specific string replacement of the known bad block.

$searchString = @"
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.main-nav ul {
    display: flex;
    gap: var(--space-xl);
}

.main-nav a {
"@

if ($content.Contains($searchString)) {
    $content = $content.Replace($searchString, "")
    Set-Content -Path $path -Value $content
    Write-Host "Removed bad CSS block." -ForegroundColor Green
}
else {
    Write-Host "Bad CSS block not found via exact string match." -ForegroundColor Yellow
}
