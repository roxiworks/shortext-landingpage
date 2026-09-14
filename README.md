# Shortext landing page

A responsive, dependency-free landing page for Shortext, ready to deploy to Vercel.

The primary download is also available from the [Microsoft Store](https://apps.microsoft.com/detail/9NC46N9J1VRK).

## Local development

```powershell
npm run dev
```

Open `http://127.0.0.1:4173`.

## Production build

```powershell
npm run build
```

The deployable website is generated in `dist/`.

## Deploy to Vercel

1. Push the `Website-Shortext` folder to a Git repository.
2. Import the repository into Vercel.
3. If this folder is inside a larger repository, set **Root Directory** to `Website-Shortext`.
4. Vercel will run `npm run build` and publish `dist` automatically using `vercel.json`.

## Updating the Windows download

The current installer is:

`public/downloads/Shortext-Setup-1.6.16.exe`

After building a new Shortext installer, run:

```powershell
npm run update-release -- 1.6.17
```

By default, the command looks for:

`..\installer\output\Shortext-Setup-1.6.17.exe`

To use an installer from another location:

```powershell
npm run update-release -- 1.6.17 "C:\path\to\Shortext-Setup-1.6.17.exe"
```

This command copies the installer, updates every website download link and visible version label, removes the superseded website installer, and rebuilds `dist/`. Commit and deploy the resulting changes to publish the update.

If a local download ever reports that the file is unavailable, stop any old preview with `Ctrl+C`, run `npm run dev` again, and hard-refresh the browser with `Ctrl+F5`.

The site uses the official Shortext logo and bundled Google Sans font files from the desktop project.
