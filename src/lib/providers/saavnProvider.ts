/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Song, IMusicProvider } from './types';

class CircuitBreaker {
  private failureCount = 0;
  private maxFailures = 3;
  private cooldownMs = 60000; // 60s
  private nextAllowedTime = 0;

  recordSuccess() {
    this.failureCount = 0;
  }

  recordFailure() {
    this.failureCount++;
    if (this.failureCount >= this.maxFailures) {
      this.nextAllowedTime = Date.now() + this.cooldownMs;
      console.warn("Saavn API Circuit Breaker TRIPPED. Cooldown active for 60s.");
    }
  }

  isOpen(): boolean {
    if (this.failureCount >= this.maxFailures) {
      if (Date.now() >= this.nextAllowedTime) {
        this.failureCount = 0; // Half-open
        return false;
      }
      return true;
    }
    return false;
  }
}

export class SaavnProvider implements IMusicProvider {
  baseUrl: string;
  private circuitBreaker: CircuitBreaker;

  constructor() {
    this.baseUrl = "https://savan-api-seven.vercel.app/api"; 
    this.circuitBreaker = new CircuitBreaker();
  }

  private dispatchError(detail: string) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("api-error", { detail }));
    }
  }

  async getSuggestions(songId: string): Promise<Song[]> {
    if (this.circuitBreaker.isOpen()) {
      console.warn("Saavn suggestions request blocked by Circuit Breaker.");
      this.dispatchError("CIRCUIT_BREAKER_ACTIVE");
      return [];
    }

    try {
      const res = await fetch(`${this.baseUrl}/songs/${songId}/suggestions`);
      if (!res.ok) {
        throw new Error(`Saavn suggestions returned status ${res.status}`);
      }
      const data = await res.json();
      const results = data.data || data;
      if (!Array.isArray(results)) return [];
      
      this.circuitBreaker.recordSuccess();

      return results.map((song: any) => {
        const thumb = song.image?.find((img: any) => img.quality === '500x500') || song.image?.[song.image?.length - 1];
        const thumbUrl = thumb?.url || thumb?.link || (typeof song.image === 'string' ? song.image : '');
        
        return {
          videoId: song.id,
          title: song.title?.replace(/&quot;/g, '"') || song.song || song.name, 
          artist: song.primaryArtists || song.singers || song.artists?.primary?.[0]?.name,
          thumbnailUrl: thumbUrl,
          downloadUrls: song.downloadUrl || song.media_url
        };
      });
    } catch (err) {
      console.error("Saavn suggestions failed:", err);
      this.circuitBreaker.recordFailure();
      this.dispatchError("DISCONNECT_ERROR");
      return [];
    }
  }

  async search(query: string): Promise<Song[]> {
    if (this.circuitBreaker.isOpen()) {
      console.warn("Saavn search request blocked by Circuit Breaker.");
      this.dispatchError("CIRCUIT_BREAKER_ACTIVE");
      return [];
    }

    console.log("Searching Saavn for:", query);
    try {
      const res = await fetch(`${this.baseUrl}/search/songs?query=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error(`Saavn search returned status ${res.status}`);
      }
      const data = await res.json();
      
      const results = data.data?.results || data.results || data; 
      if (!Array.isArray(results)) {
        return [];
      }
      
      this.circuitBreaker.recordSuccess();

      return results.map((song: any) => {
        const thumb = song.image?.find((img: any) => img.quality === '500x500') || song.image?.[song.image?.length - 1];
        const thumbUrl = thumb?.url || thumb?.link || (typeof song.image === 'string' ? song.image : '');
        
        return {
          videoId: song.id,
          title: song.title?.replace(/&quot;/g, '"') || song.song || song.name, 
          artist: song.primaryArtists || song.singers || song.artists?.primary?.[0]?.name,
          thumbnailUrl: thumbUrl,
          downloadUrls: song.downloadUrl || song.media_url
        };
      });
    } catch (err) {
      console.error("Saavn search failed:", err);
      this.circuitBreaker.recordFailure();
      this.dispatchError("DISCONNECT_ERROR");
      return [];
    }
  }

  async getStreamUrl(song: Song): Promise<string | null> {
    const cacheKey = `echo_stream_${song.videoId}`;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) return cached;
      }
    } catch(e) {}

    if (this.circuitBreaker.isOpen()) {
      console.warn("Saavn stream resolution blocked by Circuit Breaker.");
      this.dispatchError("CIRCUIT_BREAKER_ACTIVE");
      return null;
    }

    console.log("Resolving Saavn stream for:", song.title);
    let streamUrl: string | null = null;
    try {
      if (song.downloadUrls && Array.isArray(song.downloadUrls) && song.downloadUrls.length > 0) {
        const bestQuality = song.downloadUrls.find((link: any) => link.quality === '320kbps') || song.downloadUrls[song.downloadUrls.length - 1];
        streamUrl = bestQuality.url || bestQuality.link || (typeof bestQuality === 'string' ? bestQuality : null);
      } else {
        const res = await fetch(`${this.baseUrl}/songs?ids=${song.videoId}`);
        if (!res.ok) {
          throw new Error(`Saavn stream details returned status ${res.status}`);
        }
        const data = await res.json();
        const songData = data.data?.[0] || data[0] || data;
        
        if (songData) {
          const downloads = songData.downloadUrl || songData.media_url;
          if (downloads && Array.isArray(downloads) && downloads.length > 0) {
              const bestQuality = downloads.find((link: any) => link.quality === '320kbps') || downloads[downloads.length - 1];
              streamUrl = bestQuality.url || bestQuality.link || (typeof bestQuality === 'string' ? bestQuality : null);
          }
        }
      }
      
      this.circuitBreaker.recordSuccess();
    } catch (err) {
      console.error("Saavn stream resolution failed:", err);
      this.circuitBreaker.recordFailure();
      this.dispatchError("DISCONNECT_ERROR");
    }

    if (streamUrl) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem(cacheKey, streamUrl);
        }
      } catch(e) {}
      return streamUrl;
    }
    return null;
  }
}

export const musicApi = new SaavnProvider();
