from typing import Dict, Optional
from io import BytesIO

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


class MediaAnalyzer:
    """
    Analyze media files for quality metrics like resolution, orientation, aspect ratio
    """
    
    def __init__(self):
        self.supported_image_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        self.supported_video_types = ["video/mp4", "video/quicktime", "video/webm"]
    
    def analyze(self, file_bytes: bytes, content_type: str) -> Dict:
        """
        Analyze media file and return quality metrics
        """
        if content_type in self.supported_image_types:
            return self._analyze_image(file_bytes)
        elif content_type in self.supported_video_types:
            return self._analyze_video_fallback(file_bytes)
        else:
            return {
                "error": "Unsupported media type",
                "supported_types": self.supported_image_types + self.supported_video_types
            }
    
    def _analyze_image(self, file_bytes: bytes) -> Dict:
        """
        Analyze image file using PIL
        """
        if not PIL_AVAILABLE:
            return self._fallback_analysis()
        
        try:
            image = Image.open(BytesIO(file_bytes))
            width, height = image.size
            
            return self._generate_metrics(width, height, "image")
        except Exception as e:
            return {
                "error": f"Failed to analyze image: {str(e)}",
                "type": "image"
            }
    
    def _analyze_video_fallback(self, file_bytes: bytes) -> Dict:
        """
        Fallback video analysis without OpenCV dependency
        For production, would use opencv-python or ffprobe
        """
        # Return reasonable defaults for video
        return {
            "type": "video",
            "width": 1920,
            "height": 1080,
            "orientation": "Landscape",
            "aspectRatio": "16:9",
            "resolution": "1080p",
            "qualityScore": "High",
            "note": "Video analyzed with default values. Install opencv-python for accurate analysis."
        }
    
    def _generate_metrics(self, width: int, height: int, media_type: str) -> Dict:
        """
        Generate quality metrics from dimensions
        """
        # Determine orientation
        if width > height:
            orientation = "Landscape"
        elif width < height:
            orientation = "Portrait"
        else:
            orientation = "Square"
        
        # Calculate aspect ratio
        def gcd(a, b):
            while b:
                a, b = b, a % b
            return a
        
        g = gcd(width, height)
        aspect_ratio = f"{width // g}:{height // g}"
        
        # Determine resolution
        max_dimension = max(width, height)
        if max_dimension >= 2160:
            resolution = "4K"
        elif max_dimension >= 1080:
            resolution = "1080p"
        elif max_dimension >= 720:
            resolution = "720p"
        elif max_dimension >= 480:
            resolution = "480p"
        else:
            resolution = "SD"
        
        # Determine quality score
        if resolution in ["4K", "1080p"]:
            quality_score = "High"
        elif resolution == "720p":
            quality_score = "Medium"
        else:
            quality_score = "Low"
        
        return {
            "type": media_type,
            "width": width,
            "height": height,
            "orientation": orientation,
            "aspectRatio": aspect_ratio,
            "resolution": resolution,
            "qualityScore": quality_score
        }
    
    def _fallback_analysis(self) -> Dict:
        """
        Return default values when PIL is not available
        """
        return {
            "type": "unknown",
            "width": 1080,
            "height": 1920,
            "orientation": "Portrait",
            "aspectRatio": "9:16",
            "resolution": "1080p",
            "qualityScore": "High",
            "note": "Install Pillow for accurate image analysis"
        }
