# demo-rmr

# GH pages publish
pnpm i
pnpm build
cp dist/spa/index.html dist/spa/404.html
rm -rf docs && mkdir -p docs
cp -R dist/spa/* docs/
git add docs
git commit -m "Publish GH Pages to docs"
git push origin main