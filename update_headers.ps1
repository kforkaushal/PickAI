
# Define the new header template
# NOTE: We will use a placeholder for the logo link and nav links to adjust relative paths if needed, 
# but for now, assuming root-relative links (starting with /) or absolute links is safest if the server supports it.
# If not, we might need a smarter replacement. 
# Given the user's current setup, they use relative links like "tools/index.html". 
# Let's check a subdirectory file first to see how they link to home.

$rootPath = "c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI"
$files = Get-ChildItem -Path $rootPath -Filter *.html -Recurse

# Define the regex to capture the old header
# The old header structure:
# <header class="site-header">
#   <div class="container header-inner">
#     <div class="logo">...</div>
#     <nav>...</nav>
#     <div class="actions">...</div>
#   </div>
# </header>

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # We need to construct a new header consistent with the file's depth if relative links are used.
    # However, since we are moving elements around, we must be careful not to break existing hrefs if they differ per file.
    # Strategy: Parse the existing links from the file and re-inject them into the new structure?
    # Or simplified strategy: Just replace the layout wrapper, keeping the inner HTML of logo/nav?
    
    # Let's try the wrapper replacement strategy.
    
    # 1. Extract Logo content
    if ($content -match '<div class="logo">\s*([\s\S]*?)\s*</div>') {
        $logoContent = $matches[1]
    } else {
        Write-Host "No logo found in $($file.Name)" -ForegroundColor Yellow
        continue
    }

    # 2. Extract Nav content
    if ($content -match '<nav class="main-nav">\s*([\s\S]*?)\s*</nav>') {
        $navContent = $matches[1]
    } else {
        Write-Host "No nav found in $($file.Name)" -ForegroundColor Yellow
        continue
    }
    
    # 3. New Header Structure
    $newHeader = @"
    <header class="site-header">
        <div class="container header-inner">
            <!-- Top Row: Menu | Logo | Search -->
            <div class="header-top">
                <button class="menu-toggle" aria-label="Open Menu">
                    <span class="hamburger-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </span>
                </button>

                <div class="logo">
                    $logoContent
                </div>

                <div class="header-actions">
                    <!-- Simple search icon SVG -->
                    <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <!-- Bottom Row: Navigation -->
            <nav class="main-nav">
                $navContent
            </nav>
        </div>
    </header>
"@
    
    # Replace the old header block with the new one
    # We search for <header class="site-header"> ... </header>
    $content = $content -replace '(?s)<header class="site-header">.*?</header>', $newHeader
    
    Set-Content -Path $file.FullName -Value $content
    Write-Host "Updated $($file.Name)" -ForegroundColor Green
}
