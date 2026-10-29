#!/usr/bin/env python3
"""Set a guide page's date in every place it appears. No build step on this site, so this is the one switch.

    python3 scripts/set-guide-date.py how-to-get-clients 2026-11-02            # an edit: Updated + dateModified
    python3 scripts/set-guide-date.py how-to-get-clients 2026-11-02 --published  # first publish: both dates

Touches <slug>/index.html (byline <time>, article:*_time meta, JSON-LD datePublished/dateModified)
and the page's <lastmod> in sitemap.xml. Prints each change; exits 1 if a spot was not found.
"""
import datetime, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 2:
        sys.exit(__doc__)
    slug, iso = args
    published = '--published' in sys.argv
    day = datetime.date.fromisoformat(iso)
    shown = f"{day:%B} {day.day}, {day.year}"
    page = ROOT / slug / 'index.html'
    html = page.read_text()
    subs = [
        (r'<time datetime="[0-9-]+" data-guide-date>[^<]*</time>', f'<time datetime="{iso}" data-guide-date>{shown}</time>'),
        (r'(<meta property="article:modified_time" content=")[0-9-]+', rf'\g<1>{iso}'),
        (r'("dateModified": ")[0-9-]+', rf'\g<1>{iso}'),
    ]
    if published:
        subs += [
            (r'(<meta property="article:published_time" content=")[0-9-]+', rf'\g<1>{iso}'),
            (r'("datePublished": ")[0-9-]+', rf'\g<1>{iso}'),
        ]
    missing = 0
    for pat, rep in subs:
        html, n = re.subn(pat, rep, html)
        print(f"{n} x {pat[:48]}")
        missing += n == 0
    page.write_text(html)
    sm = ROOT / 'sitemap.xml'
    xml = sm.read_text()
    loc = re.escape(f"https://socialmoneymodels.com/{slug}/")
    xml, n = re.subn(rf'(<loc>{loc}</loc><lastmod>)[0-9-]+', rf'\g<1>{iso}', xml)
    print(f"{n} x sitemap lastmod")
    missing += n == 0
    sm.write_text(xml)
    sys.exit(1 if missing else 0)


if __name__ == '__main__':
    main()
