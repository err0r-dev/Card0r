# Card0r - Non-Tech Setup Guide

A plain-language guide for running Card0r with Docker. No coding experience needed.

---

## What is Card0r?

Card0r creates personalised video greeting cards for multiple people at once. You provide a list of recipients (names and a bit of guidance about each person), choose a holiday theme, and the app uses AI to write unique messages for each person. It then renders animated videos with background music that you can download and share.

Perfect for sending holiday greetings to your team, family, or friends without creating each card individually.

---

## What you need

- **This project folder** (a "repo") on your computer. A repo is just a folder that holds the app's files. You can download it as a ZIP from GitHub.
- **Docker Desktop** installed and running: https://www.docker.com/products/docker-desktop/
  Think of Docker as a container that bundles everything the app needs so you do not have to install tools one by one.
- **An OpenAI API key**: https://platform.openai.com/api-keys
  This powers the AI that writes personalised messages. You pay OpenAI directly based on usage (typically pennies per message).
- **A Jamendo API key** (free): https://developer.jamendo.com/v3.0
  This provides royalty-free background music for your videos.
- **A web browser** (Chrome, Firefox, Safari, Edge).
- **A terminal/command prompt** (the text window where you type commands).

---

## How to open a terminal

**Mac:**
Press Command+Space, type "Terminal", press Enter.

**Windows:**
Press the Windows key, type "PowerShell" (or "Terminal" on Windows 11), press Enter.

Once it is open, you can type commands and press Enter to run them.

---

## Start the app with Docker

1. **Get the project onto your computer**
   Download the ZIP from GitHub, unzip it, and you will have a folder named `Card0r`.

2. **Open a terminal and move into the project folder**
   - Mac example: `cd ~/Downloads/Card0r` (adjust path if you moved it)
   - Windows example: `cd "C:\Users\YOURNAME\Downloads\Card0r"` (replace YOURNAME)

3. **Make sure Docker Desktop is running**
   Open Docker Desktop and leave it running in the background. You should see the whale icon in your system tray.

4. **Build the app** (first run takes several minutes)
   ```
   docker-compose build
   ```

5. **Start the app**
   ```
   docker-compose up -d
   ```

6. **Open the app**
   Go to http://localhost:3000 in your web browser.

---

## Using the app

### First-time setup

1. **Enter your API keys**
   When you first open the app, you will see a setup screen asking for your OpenAI and Jamendo API keys. Paste them in and click "Get Started". These keys are stored only in your browser.

### Creating video cards

1. **Add your recipients**
   You have two options:
   - **Upload a spreadsheet**: Drop a CSV or Excel file with columns for Name and Message guidance (what you want to say to each person). Click "Download Template" for an example file.
   - **Add manually**: Type in each person's name and guidance one by one.

2. **Enter sender name** (optional)
   Add your name or your organisation's name. This appears in the video as "From: [Your Name]".

3. **Choose a theme**
   Pick from 17 holiday themes organised by category:
   - Western: Christmas, New Year, Easter, Valentine's Day, Halloween, Thanksgiving
   - Jewish: Rosh Hashanah, Hanukkah, Passover
   - Islamic: Eid al-Fitr, Eid al-Adha, Ramadan
   - Asian: Chinese New Year, Diwali, Lunar New Year
   - General: Thank You, Congratulations

4. **Choose video format**
   - 1080p HD (standard widescreen)
   - 4K Ultra HD (high quality, larger files)
   - Square (Instagram posts)
   - Social Stories (vertical, for Instagram/TikTok stories)

5. **Select background music**
   The app searches Jamendo for theme-appropriate music. Pick a track or skip to have no music.

6. **Generate messages**
   Click to have AI write personalised messages. You can adjust:
   - **Message length**: How many words (5-100)
   - **Originality**: How creative vs. close to your guidance

7. **Review and edit messages**
   Read through the AI-generated messages. Click the edit button on any message to make changes. When happy, click "Confirm Messages & Generate Videos".

8. **Wait for videos to render**
   This takes 30-60 seconds per video. You can see progress for each recipient.

9. **Download your videos**
   - Download individual videos by clicking the download button
   - Download all videos as a ZIP file by clicking "Download All as ZIP"
   - Preview any video before downloading
   - Delete videos you do not want

---

## Stopping the app

When you are done, stop the containers:

```
docker-compose down
```

To start again later, just run `docker-compose up -d` from the Card0r folder.

---

## Notes and troubleshooting

### Port already in use

If you see an error about port 3000 or 3001, another app is using it. Edit the `docker-compose.yml` file and change the port numbers, or stop the other application.

### Video generation is slow

Video rendering is intensive. Each video takes 30-60 seconds for 1080p, longer for 4K. Make sure Docker Desktop has at least 4GB RAM allocated (check Docker Desktop settings under Resources).

### Cannot connect to API / generation fails

Check that both containers are running:

```
docker-compose ps
```

Both `card0r-frontend` and `card0r-backend` should show as running.

If something is wrong, check the logs:

```
docker-compose logs backend
```

### API key errors

- **OpenAI**: Make sure your key starts with `sk-` and your account has credits
- **Jamendo**: The key is your "Client ID" from the Jamendo developer portal

### Dark mode

Click the moon/sun icon in the top right corner to toggle between light and dark themes.

### Need to rebuild after updates

If you download a new version of the app:

```
docker-compose build --no-cache
docker-compose up -d
```

---

## Tips for best results

1. **Be specific in your guidance**: Instead of "Say happy birthday", try "Mention their love of gardening and wish them a relaxing birthday".

2. **Keep recipient lists manageable**: The app works best with up to 50 recipients at a time.

3. **Preview before downloading all**: Check a few videos to make sure you are happy with the theme and music choice.

4. **Use the template**: Download the CSV template to see the exact format expected for bulk uploads.

---

## Getting help

If you encounter issues:
1. Check the troubleshooting section above
2. Look at the container logs: `docker-compose logs`
3. Report issues at: https://github.com/err0r-dev/card0r/issues

---

Created by [err0r.dev](https://err0r.dev)
