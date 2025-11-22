import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Link,
  Image,
} from '@chakra-ui/react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { LuCheck, LuPlay, LuDownload, LuFolderTree, LuCloud } from 'react-icons/lu'
import splashContent from '../data/splash-content.json'
import { useSettingsStore } from '../store/settingsStore'
import { useModal } from './modals/ModalProvider'
import { logger } from '../lib/logger'
import logoImage from '../assets/logo_v2 1.png'
import appScreenshot from '../assets/splash_images/app-screenshot.jpg'
import themeSwitchingImage from '../assets/splash_images/theme-switching.jpg'
import dataExportImage from '../assets/splash_images/data-export.jpg'
import collectionsImage from '../assets/splash_images/collections.jpg'
import themeVideo from '../assets/splash_videos/theme.mp4'
import exportVideo from '../assets/splash_videos/export.mp4'
import filtersVideo from '../assets/splash_videos/filters.mp4'
import collectionsVideo from '../assets/splash_videos/collections.mp4'
import tagsVideo from '../assets/splash_videos/tags.mp4'
import tagsImage from '../assets/splash_images/tags.png'
import extensionVideo from '../assets/splash_videos/extension.mp4'
import extensionImage from '../assets/splash_images/extension.png'
import { APP_NAME, APP_COPYRIGHT, CHROME_EXTENSION_URL } from '../constants/app'

interface FeatureShowcaseProps {
  badge: string
  title: string
  description: string
  highlights: string[]
  index: number
  onImageClick?: () => void
  videoSrc?: string
  thumbnailSrc?: string
}

const FeatureShowcase = ({
  badge,
  title,
  description,
  highlights,
  index,
  onImageClick,
  videoSrc,
  thumbnailSrc,
}: FeatureShowcaseProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  const handlePlayVideo = () => {
    logger.debug('Play button clicked', { context: { videoRef: videoRef.current, videoSrc } })
    setIsPlaying(true)
  }

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      logger.debug('Attempting to play video')
      videoRef.current.play()
        .then(() => {
          logger.debug('Video playing successfully')
        })
        .catch((error) => {
          logger.error('Error playing video:', error)
        })
    }
  }, [isPlaying])

  const handleVideoEnd = () => {
    setIsPlaying(false)
  }

  return (
    <Flex
      ref={ref}
      gap={{ base: 6, md: 16 }}
      align="center"
      mb={{ base: 16, md: 32 }}
      direction={{
        base: 'column',
        md: index % 2 === 0 ? 'row' : 'row-reverse',
      }}
      opacity={isVisible ? 1 : 0}
      transform={isVisible ? 'translateY(0)' : 'translateY(30px)'}
      transition="opacity 0.8s ease, transform 0.8s ease"
    >
      {/* Feature Content */}
      <VStack
        align="flex-start"
        flex={1}
        gap={6}
        minW={{ base: 'auto', md: '300px' }}
      >
        <Box
          display="inline-block"
          px={4}
          py={2}
          bg="rgba(102, 126, 234, 0.2)"
          border="1px solid rgba(102, 126, 234, 0.3)"
          borderRadius="20px"
          color="#667eea"
          fontSize="0.85rem"
          fontWeight="600"
          textTransform="uppercase"
          letterSpacing="0.5px"
        >
          {badge}
        </Box>

        <Heading
          as="h3"
          fontSize={{ base: '1.8rem', md: '2.5rem' }}
          fontWeight="700"
          color="white"
        >
          {title}
        </Heading>

        <Text fontSize="1.1rem" lineHeight="1.8" color="#a0a0a0">
          {description}
        </Text>

        <VStack
          as="ul"
          align="flex-start"
          gap={3}
          pl={0}
          css={{ listStyle: 'none' }}
        >
          {highlights.map((highlight, i) => (
            <HStack key={i} align="flex-start" gap={3}>
              <Box color="#667eea" fontSize="1.2rem" mt={1}>
                <LuCheck />
              </Box>
              <Text color="#c0c0c0" flex={1}>
                {highlight}
              </Text>
            </HStack>
          ))}
        </VStack>
      </VStack>

      {/* Feature Image/Video */}
      <Box flex={1} minW={{ base: 'auto', md: '300px' }} w="100%">
        {videoSrc && thumbnailSrc ? (
          <Box position="relative" w="100%">
            {!isPlaying ? (
              <>
                <Image
                  src={thumbnailSrc}
                  alt={title}
                  w="100%"
                  borderRadius="20px"
                  objectFit="cover"
                  boxShadow="0 10px 40px rgba(0, 0, 0, 0.4)"
                  transition="all 0.3s ease"
                />
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  borderRadius="50%"
                  w="80px"
                  h="80px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  onClick={handlePlayVideo}
                  transition="all 0.3s ease"
                  boxShadow="0 4px 15px rgba(102, 126, 234, 0.4)"
                  _hover={{
                    transform: 'translate(-50%, -50%) scale(1.1)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                  }}
                >
                  <LuPlay size={40} color="white" style={{ marginLeft: '4px' }} />
                </Box>
              </>
            ) : (
              <video
                ref={videoRef}
                src={videoSrc}
                style={{
                  width: '100%',
                  borderRadius: '20px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                }}
                onEnded={handleVideoEnd}
                controls
              />
            )}
          </Box>
        ) : title === 'Data Export' ? (
          <Image
            src={dataExportImage}
            alt="Data Export and Backup"
            w="100%"
            borderRadius="20px"
            objectFit="cover"
            boxShadow="0 10px 40px rgba(0, 0, 0, 0.4)"
            transition="all 0.3s ease"
            cursor="pointer"
            onClick={onImageClick}
            _hover={{ transform: 'scale(1.05)', boxShadow: '0 15px 50px rgba(102, 126, 234, 0.5)' }}
          />
        ) : (
          <Box
            w="100%"
            aspectRatio="16/10"
            bg="rgba(255, 255, 255, 0.03)"
            border="2px dashed rgba(255, 255, 255, 0.2)"
            borderRadius="20px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="#666"
            fontSize="1rem"
            transition="all 0.3s ease"
            css={{
              backdropFilter: 'blur(10px)',
              '&:hover': {
                transform: 'scale(1.02)',
                borderColor: 'rgba(102, 126, 234, 0.5)',
              },
            }}
          >
            Screenshot: {title}
          </Box>
        )}
      </Box>
    </Flex>
  )
}

const SplashPage = () => {
  const navigate = useNavigate()
  const setHasSeenSplash = useSettingsStore((state) => state.setHasSeenSplash)
  const { showImageModal } = useModal()

  const handleGetStarted = () => {
    setHasSeenSplash(true)
    navigate('/')
  }

  // Image and video mapping for features
  const featureImages: Record<string, string> = {
    'Custom Collections': collectionsImage,
    'X/Twitter Import': extensionImage,
    'Tag Management': tagsImage,
    'Dark & Light Mode': themeSwitchingImage,
    'Data Export': dataExportImage,
  }

  const featureVideos: Record<string, string> = {
    'Custom Collections': collectionsVideo,
    'Advanced Filtering': filtersVideo,
    'X/Twitter Import': extensionVideo,
    'Tag Management': tagsVideo,
    'Data Export': exportVideo,
    'Dark & Light Mode': themeVideo,
  }

  const handleImageClick = (title: string) => {
    const imageSrc = featureImages[title]
    if (imageSrc) {
      showImageModal({
        images: [imageSrc],
        initialIndex: 0,
        title,
      })
    }
  }

  return (
    <Box
      minH="100vh"
      w="100%"
      maxW="100vw"
      overflowX="hidden"
      overflowY="auto"
      position="relative"
      color="white"
      css={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        backgroundColor: '#0a0a0a',
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(120, 40, 200, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 40, 120, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 40% 90%, rgba(40, 180, 255, 0.15) 0%, transparent 50%)
        `,
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        '&::-webkit-scrollbar': { width: '8px' },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.05)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(255, 255, 255, 0.3)',
        },
      }}
    >
      {/* Navigation */}
      <Flex
        justify="space-between"
        align="center"
        px="5%"
        py={6}
        position="fixed"
        top={0}
        w="100%"
        bg="rgba(10, 10, 10, 0.8)"
        css={{ backdropFilter: 'blur(10px)' }}
        borderBottom="1px solid rgba(255, 255, 255, 0.1)"
        zIndex={1000}
      >
        <HStack
          gap={3}
          cursor="pointer"
          onClick={() => navigate('/')}
          _hover={{ opacity: 0.8 }}
          transition="opacity 0.2s"
        >
          <Image
            src={logoImage}
            alt={`${APP_NAME} Logo`}
            h="40px"
            w="auto"
            borderRadius="8px"
            objectFit="contain"
          />
          <Heading
            fontSize="1.5rem"
            fontWeight="700"
            css={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {APP_NAME}
          </Heading>
        </HStack>
        <Button
          size="lg"
          style={{ background: 'var(--color-blue)' }}
          color="white"
          borderRadius="8px"
          fontWeight="600"
          onClick={handleGetStarted}
          _hover={{
            bg: 'var(--color-blue-hover)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)',
          }}
          _active={{
            transform: 'translateY(0)',
          }}
          transition="all 0.2s ease"
        >
          Get Started
        </Button>
      </Flex>

      {/* Hero Section */}
      <Flex
        minH="100vh"
        direction="column"
        justify="center"
        align="center"
        textAlign="center"
        px="5%"
        pt="8rem"
        pb="4rem"
        position="relative"
      >
        <VStack gap={12} maxW="900px" mb={12}>
          <Heading
            as="h1"
            fontSize={{ base: '2.5rem', md: '5rem' }}
            fontWeight="800"
            mb={6}
            css={{
              background: 'linear-gradient(135deg, #ffffff 0%, #a8a8a8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'fadeInUp 0.8s ease',
            }}
          >
            {splashContent.hero.title}
          </Heading>

          <Text
            fontSize={{ base: '1rem', md: '1.25rem' }}
            color="#a0a0a0"
            maxW="700px"
            mb={10}
            css={{ animation: 'fadeInUp 0.8s ease 0.2s backwards' }}
          >
            {splashContent.hero.subtitle}
          </Text>

          <Button
            size="lg"
            style={{ background: 'var(--color-blue)' }}
            color="white"
            fontSize="1.1rem"
            fontWeight="600"
            borderRadius="8px"
            px={10}
            py={7}
            onClick={handleGetStarted}
            css={{ animation: 'fadeInUp 0.8s ease 0.4s backwards' }}
            _hover={{
              bg: 'var(--color-blue-hover)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)',
            }}
            _active={{
              transform: 'translateY(0)',
            }}
            transition="all 0.2s ease"
          >
            {splashContent.hero.ctaText}
          </Button>
        </VStack>

        {/* Demo Window */}
        <Box
          w="100%"
          maxW="1200px"
          css={{ animation: 'fadeInUp 1s ease 0.6s backwards' }}
        >
          <Box
            bg="rgba(255, 255, 255, 0.03)"
            border="1px solid rgba(255, 255, 255, 0.1)"
            borderRadius="20px"
            p={{ base: '2rem 1rem', md: '3rem 2rem' }}
            css={{ backdropFilter: 'blur(10px)' }}
            boxShadow="0 20px 60px rgba(0, 0, 0, 0.3)"
            position="relative"
            overflow="hidden"
          >
            {/* Window Chrome */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="40px"
              bg="rgba(255, 255, 255, 0.02)"
              borderBottom="1px solid rgba(255, 255, 255, 0.1)"
            />
            <HStack
              position="absolute"
              top="15px"
              left="20px"
              gap={2}
              zIndex={1}
            >
              <Box
                w="12px"
                h="12px"
                borderRadius="50%"
                bg="rgba(255, 95, 86, 0.8)"
              />
              <Box
                w="12px"
                h="12px"
                borderRadius="50%"
                bg="rgba(255, 189, 46, 0.8)"
              />
              <Box
                w="12px"
                h="12px"
                borderRadius="50%"
                bg="rgba(40, 201, 64, 0.8)"
              />
            </HStack>

            {/* App Screenshot */}
            <Image
              src={appScreenshot}
              alt="BookmarkHub Dashboard"
              w="100%"
              borderRadius="12px"
              mt="20px"
              objectFit="cover"
              boxShadow="0 10px 40px rgba(0, 0, 0, 0.4)"
              cursor="pointer"
              transition="all 0.3s ease"
              onClick={() =>
                showImageModal({
                  images: [appScreenshot],
                  initialIndex: 0,
                  title: 'BookmarkHub Dashboard',
                })
              }
              _hover={{ transform: 'scale(1.02)', boxShadow: '0 15px 50px rgba(102, 126, 234, 0.5)' }}
            />
          </Box>
        </Box>
      </Flex>

      {/* Features Section */}
      <Box id="features" px="5%" py={{ base: 16, md: 24 }}>
        <Box maxW="1400px" mx="auto">
          <VStack textAlign="center" mb={{ base: 16, md: 20 }}>
            <Heading
              as="h2"
              fontSize={{ base: '2rem', md: '3rem' }}
              mb={4}
              pb={2}
              lineHeight="1.2"
              css={{
                background: 'linear-gradient(135deg, #ffffff 0%, #a8a8a8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {splashContent.featuresSection.title}
            </Heading>
            <Text color="#a0a0a0" fontSize="1.1rem">
              {splashContent.featuresSection.subtitle}
            </Text>
          </VStack>

          {splashContent.features.map((feature, index) => {
            // Use the mapped imports based on feature title
            const videoSrc = featureVideos[feature.title]
            const thumbnailSrc = featureImages[feature.title] || appScreenshot

            return (
              <FeatureShowcase
                key={index}
                badge={feature.badge}
                title={feature.title}
                description={feature.description}
                highlights={feature.highlights}
                index={index}
                onImageClick={() => handleImageClick(feature.title)}
                videoSrc={videoSrc}
                thumbnailSrc={thumbnailSrc}
              />
            )
          })}
        </Box>
      </Box>

      {/* How It Works Section */}
      <Box px="5%" py={{ base: 16, md: 32 }}>
        <Box maxW="1200px" mx="auto">
          <VStack textAlign="center" mb={{ base: 16, md: 20 }}>
            <Heading
              as="h2"
              fontSize={{ base: '2rem', md: '3rem' }}
              mb={4}
              pb={2}
              lineHeight="1.2"
              css={{
                background: 'linear-gradient(135deg, #ffffff 0%, #a8a8a8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {splashContent.howItWorksSection.title}
            </Heading>
            <Text color="#a0a0a0" fontSize="1.1rem">
              {splashContent.howItWorksSection.subtitle}
            </Text>
          </VStack>

          <Flex
            gap={{ base: 8, md: 12 }}
            direction={{ base: 'column', md: 'row' }}
            justify="center"
            align="stretch"
          >
            {splashContent.steps.map((step, index) => {
              const IconComponent =
                step.icon === 'download' ? LuDownload :
                step.icon === 'organize' ? LuFolderTree :
                LuCloud

              return (
                <VStack
                  key={index}
                  flex={1}
                  p={{ base: 8, md: 10 }}
                  bg="rgba(255, 255, 255, 0.03)"
                  border="1px solid rgba(255, 255, 255, 0.1)"
                  borderRadius="20px"
                  gap={6}
                  transition="all 0.3s ease"
                  css={{
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: 'rgba(102, 126, 234, 0.5)',
                      boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)',
                    },
                  }}
                >
                  <Box
                    fontSize="3rem"
                    fontWeight="800"
                    css={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {step.number}
                  </Box>

                  <Box
                    p={4}
                    bg="rgba(102, 126, 234, 0.2)"
                    borderRadius="50%"
                    border="1px solid rgba(102, 126, 234, 0.3)"
                  >
                    <IconComponent size={32} color="#667eea" />
                  </Box>

                  <Heading
                    as="h3"
                    fontSize="1.5rem"
                    fontWeight="700"
                    color="white"
                    textAlign="center"
                  >
                    {step.title}
                  </Heading>

                  <Text
                    color="#a0a0a0"
                    fontSize="1rem"
                    lineHeight="1.7"
                    textAlign="center"
                  >
                    {step.description}
                  </Text>

                  {step.icon === 'download' && (
                    <Link
                      href={CHROME_EXTENSION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      _hover={{ textDecoration: 'none' }}
                    >
                      <Button
                        size="md"
                        style={{ background: 'var(--color-blue)' }}
                        color="white"
                        fontWeight="600"
                        borderRadius="8px"
                        px={6}
                        py={5}
                        mt={2}
                        _hover={{
                          bg: 'var(--color-blue-hover)',
                          color: 'white',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)',
                        }}
                        _active={{
                          transform: 'translateY(0)',
                        }}
                        transition="all 0.2s ease"
                      >
                        Install Extension
                      </Button>
                    </Link>
                  )}
                </VStack>
              )
            })}
          </Flex>
        </Box>
      </Box>

      {/* Final CTA Section */}
      <Box px="5%" py={{ base: 16, md: 32 }} textAlign="center">
        <Heading
          as="h2"
          fontSize={{ base: '2rem', md: '3.5rem' }}
          mb={6}
          color="var(--color-text-primary)"
        >
          {splashContent.cta.title}
        </Heading>
        <Text color="#a0a0a0" fontSize="1.2rem" mb={10}>
          {splashContent.cta.subtitle}
        </Text>
        <Button
          size="lg"
          style={{ background: 'var(--color-blue)' }}
          color="white"
          fontSize="1.1rem"
          fontWeight="600"
          borderRadius="8px"
          px={10}
          py={7}
          onClick={handleGetStarted}
          _hover={{
            bg: 'var(--color-blue-hover)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)',
          }}
          _active={{
            transform: 'translateY(0)',
          }}
          transition="all 0.2s ease"
        >
          {splashContent.cta.primaryButton}
        </Button>
      </Box>

      {/* Footer */}
      <Box px="5%" py={12} borderTop="1px solid rgba(255, 255, 255, 0.1)">
        <VStack gap={6}>
          {/* Links */}
          <HStack
            gap={{ base: 4, md: 8 }}
            flexWrap="wrap"
            justify="center"
            fontSize="0.9rem"
          >
            <Link
              asChild
              color="#888"
              transition="color 0.2s"
              _hover={{ color: '#667eea', textDecoration: 'none' }}
              cursor="pointer"
            >
              <RouterLink to="/terms">Terms of Service</RouterLink>
            </Link>
            <Text color="#444">•</Text>
            <Link
              asChild
              color="#888"
              transition="color 0.2s"
              _hover={{ color: '#667eea', textDecoration: 'none' }}
              cursor="pointer"
            >
              <RouterLink to="/privacy">Privacy Policy</RouterLink>
            </Link>
            <Text color="#444">•</Text>
            <Link
              asChild
              color="#888"
              transition="color 0.2s"
              _hover={{ color: '#667eea', textDecoration: 'none' }}
              cursor="pointer"
            >
              <RouterLink to="/cookies">Cookie Policy</RouterLink>
            </Link>
            <Text color="#444">•</Text>
            <Link
              href="mailto:hello@breathworklabs.com"
              color="#888"
              transition="color 0.2s"
              _hover={{ color: '#667eea', textDecoration: 'none' }}
              cursor="pointer"
            >
              Contact Us
            </Link>
          </HStack>

          {/* Copyright */}
          <Text color="#666" fontSize="0.85rem" textAlign="center">
            {APP_COPYRIGHT}
          </Text>
        </VStack>
      </Box>
    </Box>
  )
}

export default SplashPage
