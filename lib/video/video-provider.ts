/**
 * InnovatMind School OS — Video Provider Layer & Google Drive Streaming Abstraction
 * Supports Google Drive preview/embed streaming and provides a clean abstraction for future CDN migration.
 */

export type VideoProviderType = 'GOOGLE_DRIVE' | 'CLOUDFLARE_STREAM' | 'CUSTOM_CDN' | 'EMBED' | 'YOUTUBE' | 'S3_CLOUDFRONT' | 'LOCAL';

export interface VideoPlaybackMetadata {
  provider: VideoProviderType;
  fileId: string;
  embedUrl: string;
  directPlaybackUrl?: string;
  durationSeconds?: number;
  fileName?: string;
  resolution?: string;
  validationStatus: 'VALID' | 'INVALID_URL' | 'REQUIRES_SHARING_PERMISSION' | 'NOT_CONFIGURED';
  errorMessage?: string;
}

export interface IVideoProvider {
  readonly type: VideoProviderType;
  resolvePlaybackMetadata(videoRef: string, fileName?: string): VideoPlaybackMetadata;
  validateFileAccess(videoRef: string): Promise<{ isValid: boolean; message: string }>;
}

/**
 * Google Drive Video Provider Implementation
 * Standardizes Google Drive links into secure embed URLs suitable for mobile iframe streaming.
 */
export class GoogleDriveProvider implements IVideoProvider {
  readonly type: VideoProviderType = 'GOOGLE_DRIVE';

  /**
   * Extract Google Drive File ID from diverse URL formats or bare IDs
   * Supported formats:
   * - https://drive.google.com/file/d/{FILE_ID}/view
   * - https://drive.google.com/file/d/{FILE_ID}/preview
   * - https://drive.google.com/open?id={FILE_ID}
   * - {FILE_ID} (Raw alphanumeric string)
   */
  public extractDriveFileId(rawRef: string): string | null {
    if (!rawRef || typeof rawRef !== 'string') return null;
    const trimmed = rawRef.trim();

    // Check standard /file/d/{id}/ pattern
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      return fileDMatch[1];
    }

    // Check id={id} query parameter
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return idParamMatch[1];
    }

    // If string itself looks like a Drive ID (typically 25-45 characters, alphanumeric, underscores/hyphens)
    if (/^[a-zA-Z0-9_-]{15,55}$/.test(trimmed)) {
      return trimmed;
    }

    return null;
  }

  public resolvePlaybackMetadata(videoRef: string, fileName?: string): VideoPlaybackMetadata {
    if (!videoRef || !videoRef.trim()) {
      return {
        provider: 'GOOGLE_DRIVE',
        fileId: '',
        embedUrl: '',
        validationStatus: 'NOT_CONFIGURED',
        errorMessage: 'No video reference provided.'
      };
    }

    const fileId = this.extractDriveFileId(videoRef);
    if (!fileId) {
      return {
        provider: 'GOOGLE_DRIVE',
        fileId: '',
        embedUrl: videoRef,
        validationStatus: 'INVALID_URL',
        errorMessage: 'Invalid Google Drive link or file ID. Please provide a valid drive URL or ID.'
      };
    }

    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    return {
      provider: 'GOOGLE_DRIVE',
      fileId,
      embedUrl,
      directPlaybackUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      fileName: fileName || `Google_Drive_Video_${fileId}.mp4`,
      validationStatus: 'VALID'
    };
  }

  public async validateFileAccess(videoRef: string): Promise<{ isValid: boolean; message: string }> {
    const meta = this.resolvePlaybackMetadata(videoRef);
    if (meta.validationStatus !== 'VALID') {
      return { isValid: false, message: meta.errorMessage || 'Invalid video link' };
    }
    return {
      isValid: true,
      message: `Google Drive file ID '${meta.fileId}' resolved to valid embed URL.`
    };
  }
}

/**
 * Cloudflare Stream & CDN Provider (Prepared for future seamless migration)
 */
export class CloudflareStreamProvider implements IVideoProvider {
  readonly type: VideoProviderType = 'CLOUDFLARE_STREAM';

  public resolvePlaybackMetadata(videoRef: string, fileName?: string): VideoPlaybackMetadata {
    const trimmed = (videoRef || '').trim();
    if (!trimmed) {
      return {
        provider: 'CLOUDFLARE_STREAM',
        fileId: '',
        embedUrl: '',
        validationStatus: 'NOT_CONFIGURED',
        errorMessage: 'No Cloudflare Stream reference provided.'
      };
    }

    // Example Cloudflare stream video URL
    const isStreamUrl = trimmed.includes('cloudflarestream.com') || trimmed.includes('videodelivery.net');
    const fileId = trimmed.split('/').pop()?.split('?')[0] || trimmed;
    const embedUrl = isStreamUrl ? trimmed : `https://iframe.videodelivery.net/${fileId}`;

    return {
      provider: 'CLOUDFLARE_STREAM',
      fileId,
      embedUrl,
      fileName: fileName || `CDN_Stream_${fileId}.mp4`,
      validationStatus: 'VALID'
    };
  }

  public async validateFileAccess(videoRef: string): Promise<{ isValid: boolean; message: string }> {
    const meta = this.resolvePlaybackMetadata(videoRef);
    return { isValid: meta.validationStatus === 'VALID', message: 'Cloudflare Stream ready.' };
  }
}

/**
 * Factory for Video Providers
 */
export class VideoProviderFactory {
  private static driveProvider = new GoogleDriveProvider();
  private static cdnProvider = new CloudflareStreamProvider();

  public static getProvider(providerType: VideoProviderType = 'GOOGLE_DRIVE'): IVideoProvider {
    switch (providerType) {
      case 'CLOUDFLARE_STREAM':
      case 'CUSTOM_CDN':
        return this.cdnProvider;
      case 'GOOGLE_DRIVE':
      case 'EMBED':
      default:
        return this.driveProvider;
    }
  }

  public static resolve(providerType: VideoProviderType, videoRef: string, fileName?: string): VideoPlaybackMetadata {
    const provider = this.getProvider(providerType);
    return provider.resolvePlaybackMetadata(videoRef, fileName);
  }
}
