from typing import Dict, List, Optional


class RecommendationEngine:
    """
    Generate actionable recommendations based on content analysis
    """
    
    def __init__(self):
        # Platform-specific tips
        self.platform_tips = {
            "instagram": {
                "high": [
                    "🔥 Your content is optimized for viral potential!",
                    "Use Instagram Stories to tease this post",
                    "Engage with comments in the first hour for algorithm boost",
                    "Consider using Reels format for 2x more reach",
                    "Cross-post to your story with countdown sticker"
                ],
                "medium": [
                    "Add a call-to-action in your caption",
                    "Use location tags for local discoverability",
                    "Post consistently at this time for 2 weeks",
                    "Create a carousel post for 3x engagement",
                    "Use trending audio in your Reels"
                ],
                "low": [
                    "Focus on improving content quality first",
                    "Study top performers in your niche",
                    "Consider vertical video format",
                    "Use more specific niche hashtags",
                    "Try the hook-twist-punch caption format"
                ]
            },
            "tiktok": {
                "high": [
                    "🚀 Ready for the For You Page!",
                    "Respond to comments with video replies",
                    "Create a follow-up video if this performs well",
                    "Use the green screen effect for reaction content",
                    "Pin this to your profile if it goes viral"
                ],
                "medium": [
                    "Hook viewers in the first 0.5 seconds",
                    "Use trending sounds for visibility boost",
                    "Add text overlays for accessibility",
                    "End with a question to boost comments",
                    "Post 3-4 times daily for best results"
                ],
                "low": [
                    "Keep videos between 15-60 seconds",
                    "Use trending effects and filters",
                    "Study viral videos in your niche",
                    "Focus on entertainment value",
                    "Participate in trending challenges"
                ]
            },
            "youtube": {
                "high": [
                    "🎬 Optimized for YouTube success!",
                    "Create chapters for better retention",
                    "Design a custom thumbnail with faces",
                    "Add end screens for more watch time",
                    "Pin a comment with additional context"
                ],
                "medium": [
                    "Improve your thumbnail click-through rate",
                    "Ask viewers to subscribe at the right moment",
                    "Create playlists for related content",
                    "Use YouTube Shorts to grow audience",
                    "Collaborate with similar creators"
                ],
                "low": [
                    "Focus on watch time over views",
                    "Study your audience retention graphs",
                    "Create longer, more valuable content",
                    "Optimize titles for search",
                    "Respond to every comment for 24 hours"
                ]
            },
            "twitter": {
                "high": [
                    "🐦 Thread potential detected!",
                    "Quote tweet this with additional thoughts",
                    "Engage with replies quickly",
                    "Schedule follow-up tweets for momentum",
                    "Pin this tweet to your profile"
                ],
                "medium": [
                    "Add a relevant image or video",
                    "Use 1-2 strategic hashtags only",
                    "Ask a question to boost engagement",
                    "Join trending conversations",
                    "Create a thread for complex topics"
                ],
                "low": [
                    "Keep tweets concise and punchy",
                    "Lead with the most valuable insight",
                    "Build in public for authentic engagement",
                    "Engage with your community first",
                    "Use polls for easy engagement"
                ]
            },
            "facebook": {
                "high": [
                    "📘 Great Facebook content!",
                    "Share to relevant Groups for more reach",
                    "Create a poll for additional engagement",
                    "Boost post if it gains early traction",
                    "Cross-post to Instagram"
                ],
                "medium": [
                    "Add a video for 2x reach",
                    "Ask for opinions to boost comments",
                    "Use Facebook Live for real-time engagement",
                    "Create an event around your content",
                    "Tag relevant people or pages"
                ],
                "low": [
                    "Focus on community building",
                    "Share valuable information, not promotion",
                    "Use native video over links",
                    "Engage in Facebook Groups",
                    "Post when your audience is most active"
                ]
            }
        }
        
        # General tips by score level
        self.general_tips = {
            "high": [
                "A/B test different captions for similar content",
                "Save this as a template for future posts",
                "Document what worked for future reference"
            ],
            "medium": [
                "Consistency beats perfection - keep posting",
                "Analyze your best performing posts for patterns",
                "Build relationships with other creators"
            ],
            "low": [
                "Focus on providing value over going viral",
                "Quality over quantity in your posts",
                "Take time to understand your audience"
            ]
        }
    
    def generate(
        self,
        score: int,
        platform: str,
        media_info: Optional[Dict] = None,
        caption_length: int = 0,
        hashtag_count: int = 0
    ) -> Dict:
        """
        Generate personalized recommendations based on analysis
        """
        # Determine score tier
        if score >= 80:
            tier = "high"
        elif score >= 60:
            tier = "medium"
        else:
            tier = "low"
        
        # Get platform-specific tips
        platform_key = platform.lower() if platform.lower() in self.platform_tips else "instagram"
        platform_specific = self.platform_tips[platform_key][tier][:3]
        
        # Get general tips
        general = self.general_tips[tier][:2]
        
        # Combine and return
        all_tips = platform_specific + general
        
        # Add specific improvement suggestions
        improvements = self._get_specific_improvements(
            score, platform, media_info, caption_length, hashtag_count
        )
        
        return {
            "tips": all_tips,
            "priority_actions": improvements[:3] if improvements else [],
            "score_tier": tier
        }
    
    def _get_specific_improvements(
        self,
        score: int,
        platform: str,
        media_info: Optional[Dict],
        caption_length: int,
        hashtag_count: int
    ) -> List[str]:
        """
        Generate specific improvement suggestions based on weaknesses
        """
        improvements = []
        
        if media_info:
            orientation = media_info.get("orientation", "")
            resolution = media_info.get("resolution", "")
            
            # Orientation improvements
            if platform.lower() in ["instagram", "tiktok"] and orientation == "Landscape":
                improvements.append("🔄 Crop to Portrait (9:16) for 40% more reach")
            elif platform.lower() == "youtube" and orientation == "Portrait":
                improvements.append("🔄 Use Landscape (16:9) for better viewing experience")
            
            # Resolution improvements
            if resolution in ["SD", "480p"]:
                improvements.append("📹 Upgrade to 1080p for professional quality")
        
        # Caption improvements
        if caption_length < 50:
            improvements.append("✍️ Write a longer, more engaging caption")
        elif caption_length > 2000:
            improvements.append("✂️ Shorten your caption for better readability")
        
        # Hashtag improvements
        if hashtag_count < 3:
            improvements.append(f"#️⃣ Add {3 - hashtag_count} more relevant hashtags")
        elif hashtag_count > 15:
            improvements.append("#️⃣ Reduce hashtags to avoid looking spammy")
        
        return improvements
