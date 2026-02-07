
$rootPath = "c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI"
$files = Get-ChildItem -Path $rootPath -Filter *.html -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Define the Sidebar HTML
    # Note: We need to handle relative paths for links if they are not root-relative. 
    # For simplicity, assuming root-relative or adjusting based on file depth like before.
    # Let's use a placeholder for now or standard absolute paths since we used them in header too.
    # Actually, let's calculate depth again to be safe.
    
    $relativePath = $file.FullName.Substring($rootPath.Length + 1)
    $depth = ($relativePath.ToCharArray() | Where-Object { $_ -eq '\' }).Count
    $prefix = ""
    if ($depth -gt 0) { $prefix = "../" * $depth } else { $prefix = "./" }
    
    $sidebarHtml = @"
    <!-- Slide-out Sidebar -->
    <div class="sidebar-overlay"></div>
    <aside class="sidebar-menu">
        <div class="sidebar-header">
            <div class="sidebar-brand">PickAI.</div>
            <button class="close-sidebar" aria-label="Close Menu">&times;</button>
        </div>
        <div class="sidebar-content">
            <div class="sidebar-search">
                <form action="${prefix}search.html" method="get">
                    <input type="text" name="q" placeholder="Search articles...">
                </form>
            </div>
            <div class="sidebar-topics">
                <h3>Browse by Topic</h3>
                <ul>
                    <li><a href="${prefix}tools/index.html">AI Tools</a></li>
                    <li><a href="${prefix}research.html">Research</a></li>
                    <li><a href="${prefix}opinion.html">Opinion</a></li>
                    <li><a href="${prefix}explainers.html">Explainers</a></li>
                    <li><a href="${prefix}redirect.html?to=https://jobs.pickai.com">Jobs</a></li>
                </ul>
            </div>
        </div>
    </aside>
"@

    # Inject after <body> tag
    if ($content -notmatch "sidebar-menu") {
        if ($content -match "<body.*?>") {
            $content = $content -replace "(<body.*?>)", "`$1`n$sidebarHtml"
            Set-Content -Path $file.FullName -Value $content
            Write-Host "Injected sidebar into $($file.Name)" -ForegroundColor Green
        }
        else {
            Write-Host "No <body> tag in $($file.Name)" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "Sidebar already in $($file.Name)" -ForegroundColor Gray
    }
}
