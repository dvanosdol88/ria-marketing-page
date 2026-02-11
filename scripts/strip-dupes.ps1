# Strip duplicate navs/footers from individual pages

# 1. Home page - remove inline footer
$f = 'D:\RIA\RIA-marketing-page\src\app\page.tsx'
$c = [System.IO.File]::ReadAllText($f)
# Remove the footer block - everything from <footer to </footer>
$c = [regex]::Replace($c, '\s*<footer class.*?</footer>', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
# Also remove unused Image import if it was only for footer
$c = $c.Replace("import Image from ""next/image"";`n", "")
[System.IO.File]::WriteAllText($f, $c)
Write-Host "  Cleaned: page.tsx (removed inline footer + Image import)"

# 2. /improve/page.tsx - remove <SiteNav /> usage
$f = 'D:\RIA\RIA-marketing-page\src\app\improve\page.tsx'
$c = [System.IO.File]::ReadAllText($f)
$c = $c.Replace("import { SiteNav } from ""@/components/SiteNav"";`n", "")
$c = [regex]::Replace($c, '\s*<SiteNav\s*/>', '')
[System.IO.File]::WriteAllText($f, $c)
Write-Host "  Cleaned: improve/page.tsx (removed SiteNav)"

# 3. /improve-your-tools/page.tsx - remove <SiteNav /> usage
$f = 'D:\RIA\RIA-marketing-page\src\app\improve-your-tools\page.tsx'
$c = [System.IO.File]::ReadAllText($f)
$c = $c.Replace("import { SiteNav } from ""@/components/SiteNav"";`n", "")
$c = [regex]::Replace($c, '\s*<SiteNav\s*/>', '')
[System.IO.File]::WriteAllText($f, $c)
Write-Host "  Cleaned: improve-your-tools/page.tsx (removed SiteNav)"

Write-Host "`nDone - stripped duplicate nav/footer from production pages."
