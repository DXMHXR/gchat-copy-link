#!/bin/zsh
# Build the Safari extension, sign it with this Mac's Apple Development
# certificate, and install it to ~/Applications without launching the app.
# Signed builds stay enabled across Safari restarts; unsigned ones don't.
set -e
cd "${0:A:h}/GChat Copy Link"

TEAM=$(security find-certificate -c "Apple Development" -p 2>/dev/null \
  | openssl x509 -noout -subject 2>/dev/null | sed -n 's/.*OU=\([A-Z0-9]*\).*/\1/p')
if [[ -z "$TEAM" ]]; then
  echo "No Apple Development certificate found. Xcode › Settings › Accounts › add your Apple ID › Manage Certificates › + › Apple Development, then run this again."
  exit 1
fi

echo "Building (team $TEAM)…"
xcodebuild -project "GChat Copy Link.xcodeproj" -scheme "GChat Copy Link" \
  -configuration Release -derivedDataPath build DEVELOPMENT_TEAM="$TEAM" build -quiet 2>/dev/null

APP="$HOME/Applications/GChat Copy Link.app"
LSREG=/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister
rm -rf "$APP"
mkdir -p "$HOME/Applications"
cp -R "build/Build/Products/Release/GChat Copy Link.app" "$APP"
# Keep Safari from listing the build-folder copy as a second extension.
"$LSREG" -u "$PWD/build/Build/Products/Release/GChat Copy Link.app" 2>/dev/null || true
"$LSREG" -f "$APP"
pluginkit -a "$APP/Contents/PlugIns/GChat Copy Link Extension.appex"

echo "Installed. First time only: Safari › Settings › Extensions › tick \"Google Chat Copy Link\" and allow it on chat.google.com."
