; o1 IDE — custom NSIS installer pages
; Sets installer colors and adds Python check page

!macro customHeader
  !system "echo 'Building o1 IDE installer'"
!macroend

!macro customInstall
  ; Run Python packages setup after install
  ExecWait '"$INSTDIR\resources\scripts\install-toolchain-windows.ps1" -Silent'
!macroend

!macro customUnInstall
  ; Remove o1 workspace shortcut
  Delete "$DESKTOP\o1-workspace.lnk"
!macroend
