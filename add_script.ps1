
$rootPath = "c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI"
$files = Get-ChildItem -Path $rootPath -Filter *.html -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Calculate relative path to js/hamburger.js
    # 1. Get relative path of file from root
    $relativePath = $file.FullName.Substring($rootPath.Length + 1)
    # 2. Count directory separators to determine depth
    $depth = ($relativePath.ToCharArray() | Where-Object { $_ -eq '\' }).Count
    
    # 3. Construct prefix
    $prefix = ""
    if ($depth -gt 0) {
        $prefix = "../" * $depth
    } else {
        $prefix = "./"
    }
    
    $scriptTag = "<script src=""$($prefix)js/hamburger.js""></script>"
    
    # Check if script already exists
    if ($content -notmatch "js/hamburger.js") {
        # Append before </body>
        if ($content -match "</body>") {
            $content = $content -replace "</body>", "$scriptTag`n</body>"
            Set-Content -Path $file.FullName -Value $content
            Write-Host "Added script to $($file.Name)" -ForegroundColor Green
        } else {
            Write-Host "No </body> tag in $($file.Name)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Script already in $($file.Name)" -ForegroundColor Gray
    }
}
