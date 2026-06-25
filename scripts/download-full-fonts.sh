#!/bin/sh
# Download full variable font TTF files from the Google Fonts repo and convert to WOFF2.
# Unlike the subsetted woff2 shipped by @fontsource-variable, these contain ALL the
# OpenType features (glyph alternates for cv*, ss*, smcp, onum, salt, zero, etc.).
#
# Output: static/fonts/<Name>.woff2  (referenced by src/routes/fonts-full.css)
# Requires: curl + fonttools (pip install fonttools brotli)
#
# Inter is fetched separately from rsms.me (not in the google/fonts repo).

set -e
FONTS_DIR="$(dirname "$0")/../static/fonts"
mkdir -p "$FONTS_DIR"
BASE="https://github.com/google/fonts/raw/main"

download_and_convert() {
	name="$1"
	url="$2"
	ttf_file="${FONTS_DIR}/${name}.ttf"
	woff2_file="${FONTS_DIR}/${name}.woff2"

	if [ -f "$woff2_file" ]; then
		echo "  [skip] ${name}.woff2 already exists"
		return
	fi

	echo "  Downloading $name..."
	curl -sL -o "$ttf_file" "$url"

	if [ ! -s "$ttf_file" ]; then
		echo "  [FAIL] Failed to download $name"
		rm -f "$ttf_file"
		return
	fi

	echo "  Converting to woff2..."
	fonttools ttLib.woff2 compress "$ttf_file" -o "$woff2_file" 2>/dev/null

	if [ -f "$woff2_file" ]; then
		size=$(ls -lh "$woff2_file" | awk '{print $5}')
		echo "  [OK] ${name}.woff2 ($size)"
		rm -f "$ttf_file"
	else
		echo "  [FAIL] Conversion failed for $name"
		rm -f "$ttf_file"
	fi
}

# Helper for fonts hosted in the google/fonts repo.
gf() { download_and_convert "$1" "${BASE}/$2"; }

echo "Downloading and converting full variable fonts..."

# Sans-serif (google/fonts)
gf "NotoSans" "ofl/notosans/NotoSans%5Bwdth%2Cwght%5D.ttf"
gf "Roboto" "ofl/roboto/Roboto%5Bwdth%2Cwght%5D.ttf"
gf "Raleway" "ofl/raleway/Raleway%5Bwght%5D.ttf"
gf "SpaceGrotesk" "ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf"
gf "Montserrat" "ofl/montserrat/Montserrat%5Bwght%5D.ttf"
gf "SourceSans3" "ofl/sourcesans3/SourceSans3%5Bwght%5D.ttf"
gf "InstrumentSans" "ofl/instrumentsans/InstrumentSans%5Bwdth%2Cwght%5D.ttf"
# Monospace — JetBrains Mono: the google/fonts build strips cv*/ss*, so use the
# official upstream variable font which ships the complete feature set.
download_and_convert "JetBrainsMono" "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/variable/JetBrainsMono%5Bwght%5D.ttf"
# Serif (google/fonts)
gf "NotoSerif" "ofl/notoserif/NotoSerif%5Bwdth%2Cwght%5D.ttf"
gf "Merriweather" "ofl/merriweather/Merriweather%5Bopsz%2Cwdth%2Cwght%5D.ttf"
gf "PlayfairDisplay" "ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf"

# Inter is downloaded separately (from rsms.me) — see README / fonts-full.css.
if [ ! -f "${FONTS_DIR}/InterVariable.woff2" ]; then
	echo "  Downloading InterVariable from rsms.me..."
	curl -sL -o "${FONTS_DIR}/InterVariable.woff2" "https://rsms.me/inter/font-files/InterVariable.woff2"
fi

# Geist ships a full-featured variable woff2 in the official `geist` npm package
# (the google/fontsource subset only has tnum/pnum/frac). Extract it directly.
if [ ! -f "${FONTS_DIR}/Geist.woff2" ]; then
	echo "  Downloading Geist from the geist npm package..."
	tarball=$(curl -sL "https://registry.npmjs.org/geist/latest" | sed -n 's/.*"tarball":"\([^"]*\)".*/\1/p')
	if [ -n "$tarball" ]; then
		tmp=$(mktemp -d)
		curl -sL -o "$tmp/geist.tgz" "$tarball"
		tar -xzf "$tmp/geist.tgz" -C "$tmp" "package/dist/fonts/geist-sans/Geist-Variable.woff2" 2>/dev/null
		if [ -f "$tmp/package/dist/fonts/geist-sans/Geist-Variable.woff2" ]; then
			cp "$tmp/package/dist/fonts/geist-sans/Geist-Variable.woff2" "${FONTS_DIR}/Geist.woff2"
			echo "  [OK] Geist.woff2"
		else
			echo "  [FAIL] Could not extract Geist-Variable.woff2"
		fi
		rm -rf "$tmp"
	fi
fi

echo ""
echo "Done! Font files in ${FONTS_DIR}:"
ls -lh "${FONTS_DIR}"/*.woff2 2>/dev/null || echo "No woff2 files found"
