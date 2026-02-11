$f = 'D:\RIA\RIA-marketing-page\src\app\page.tsx'
$c = [System.IO.File]::ReadAllText($f)
# Remove footer block
$c = [regex]::Replace($c, '\s*<footer class.*?</footer>', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
# Remove unused Image import
$c = $c.Replace("import Image from ""next/image"";", "")
[System.IO.File]::WriteAllText($f, $c)
Write-Host "Done"
