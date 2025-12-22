import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';

export interface VideoEncodingOptions {
  framerate: number;
  width: number;
  height: number;
  audioPath?: string;
}

export async function encodeFramesToVideo(
  framesDir: string,
  outputPath: string,
  options: VideoEncodingOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = ffmpeg();

    // Input frames pattern
    command.input(path.join(framesDir, 'frame-%04d.png'));
    command.inputFPS(options.framerate);

    // If audio is provided, add it
    if (options.audioPath) {
      command.input(options.audioPath);
      command.outputOptions([
        '-c:a aac',
        '-b:a 192k',
        '-shortest' // Make video length match audio or frames (whichever is shorter)
      ]);
    }

    // Video encoding options
    command
      .videoCodec('libx264')
      .outputOptions([
        '-pix_fmt yuv420p',
        '-preset medium',
        '-crf 23', // Quality (lower is better, 23 is good quality)
        '-movflags +faststart' // Optimize for streaming
      ])
      .size(`${options.width}x${options.height}`)
      .fps(options.framerate)
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg started:', commandLine);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`Encoding progress: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log('Encoding finished successfully');
        resolve();
      })
      .on('error', (err, stdout, stderr) => {
        console.error('FFmpeg error:', err.message);
        console.error('FFmpeg stderr:', stderr);
        reject(new Error(`Video encoding failed: ${err.message}`));
      });

    command.run();
  });
}

export async function downloadAudio(url: string, outputPath: string): Promise<void> {
  try {
    const axios = (await import('axios')).default;
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    await fs.writeFile(outputPath, Buffer.from(response.data));
  } catch (error) {
    throw new Error(`Failed to download audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function cleanupFiles(paths: string[]): Promise<void> {
  for (const filePath of paths) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(`Failed to cleanup ${filePath}:`, error);
    }
  }
}

export async function cleanupDirectory(dirPath: string): Promise<void> {
  try {
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      await fs.unlink(path.join(dirPath, file));
    }
    await fs.rmdir(dirPath);
  } catch (error) {
    console.warn(`Failed to cleanup directory ${dirPath}:`, error);
  }
}
