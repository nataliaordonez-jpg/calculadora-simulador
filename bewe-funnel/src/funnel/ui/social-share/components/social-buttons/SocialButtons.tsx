import { Button, IconComponent } from '@beweco/aurora-ui'

interface SocialButtonsProps {
  shareUrl: string
  shareText: string
}

const PLATFORMS = [
  {
    name: 'WhatsApp',
    icon: 'solar:chat-round-dots-bold-duotone',
    color: 'bg-[#25D366] hover:bg-[#20BD5A]',
    getUrl: (text: string, url: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    name: 'LinkedIn',
    icon: 'solar:case-round-bold-duotone',
    color: 'bg-[#0A66C2] hover:bg-[#0958A8]',
    getUrl: (_text: string, url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'X (Twitter)',
    icon: 'solar:letter-bold-duotone',
    color: 'bg-[#1DA1F2] hover:bg-[#1A91DA]',
    getUrl: (text: string, url: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Copiar enlace',
    icon: 'solar:link-round-bold-duotone',
    color: 'bg-primary-400 hover:bg-primary-500',
    getUrl: () => '',
  },
]

export function SocialButtons({ shareUrl, shareText }: SocialButtonsProps) {
  const handleShare = (platform: typeof PLATFORMS[0]) => {
    if (platform.name === 'Copiar enlace') {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      return
    }
    const url = platform.getUrl(shareText, shareUrl)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-3">
      {PLATFORMS.map((platform) => (
        <Button
          key={platform.name}
          size="lg"
          radius="full"
          onPress={() => handleShare(platform)}
          startContent={<IconComponent icon={platform.icon} size="md" color="white" />}
          className={`w-full text-white ${platform.color}`}
        >
          Compartir en {platform.name}
        </Button>
      ))}
    </div>
  )
}
