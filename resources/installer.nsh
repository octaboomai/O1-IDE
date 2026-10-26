; o1 IDE — custom NSIS installer pages
; Sets installer colors and adds Python check page

!macro customHeader
  !system "echo 'Building o1 IDE installer'"
!macroend

!macro customInstall
  ; Desktop shortcut so users can launch o1 IDE after install
  CreateShortcut "$DESKTOP\o1 IDE.lnk" "$INSTDIR\o1 IDE.exe"
  ; Run Python packages setup after install
  ; Invoke PowerShell explicitly: a bare .ps1 runs under the default
  ; execution policy (Restricted on a fresh Windows), which silently blocks it.
  ExecWait 'powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "$INSTDIR\resources\scripts\install-toolchain-windows.ps1" -Silent'
!macroend

!macro customUnInstall
  ; Remove shortcuts
  Delete "$DESKTOP\o1 IDE.lnk"
  Delete "$DESKTOP\o1-workspace.lnk"
!macroend
