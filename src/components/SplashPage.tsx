import { Box, Flex, VStack, HStack, Text, Button, Heading } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { LuCheck } from 'react-icons/lu'
import splashContent from '../data/splash-content.json'

interface FeatureShowcaseProps {
  badge: string
  title: string
  description: string
  highlights: string[]
  index: number
}

const FeatureShowcase = ({ badge, title, description, highlights, index }: FeatureShowcaseProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

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

  return (
    <Flex
      ref={ref}
      gap={{ base: 6, md: 16 }}
      align="center"
      mb={{ base: 16, md: 32 }}
      direction={{ base: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' }}
      opacity={isVisible ? 1 : 0}
      transform={isVisible ? 'translateY(0)' : 'translateY(30px)'}
      transition="opacity 0.8s ease, transform 0.8s ease"
    >
      {/* Feature Content */}
      <VStack align="flex-start" flex={1} gap={6} minW={{ base: 'auto', md: '300px' }}>
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
          color="var(--color-text-primary)"
        >
          {title}
        </Heading>

        <Text
          fontSize="1.1rem"
          lineHeight="1.8"
          color="#a0a0a0"
        >
          {description}
        </Text>

        <VStack as="ul" align="flex-start" gap={3} pl={0} css={{ listStyle: 'none' }}>
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

      {/* Feature Image Placeholder */}
      <Box
        flex={1}
        minW={{ base: 'auto', md: '300px' }}
        w="100%"
      >
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
      </Box>
    </Flex>
  )
}

const SplashPage = () => {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    localStorage.setItem('hasSeenSplash', 'true')
    navigate('/')
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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
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
        '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.05)' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px' },
        '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(255, 255, 255, 0.3)' },
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
          X Bookmark Manager
        </Heading>
        <Button
          size="lg"
          style={{ background: 'var(--color-blue)' }}
          color="white"
          borderRadius="8px"
          fontWeight="600"
          onClick={handleGetStarted}
          _hover={{ bg: 'var(--color-blue-hover)' }}
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
            _hover={{ bg: 'var(--color-blue-hover)' }}
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
              <Box w="12px" h="12px" borderRadius="50%" bg="rgba(255, 95, 86, 0.8)" />
              <Box w="12px" h="12px" borderRadius="50%" bg="rgba(255, 189, 46, 0.8)" />
              <Box w="12px" h="12px" borderRadius="50%" bg="rgba(40, 201, 64, 0.8)" />
            </HStack>

            {/* Screenshot Placeholder */}
            <Box
              w="100%"
              aspectRatio="16/9"
              bg="rgba(255, 255, 255, 0.02)"
              border="2px dashed rgba(102, 126, 234, 0.3)"
              borderRadius="12px"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              color="#667eea"
              fontSize="1.1rem"
              mt="20px"
            >
              Main App Screenshot Goes Here
              <Text fontSize="0.85rem" color="#888" mt={2}>
                (Dashboard view with collections, search bar, and bookmarks)
              </Text>
            </Box>
          </Box>

          {/* Stats Bar */}
          <Flex
            justify="center"
            gap={{ base: 6, md: 12 }}
            mt={12}
            flexWrap="wrap"
          >
            {splashContent.stats.map((stat, i) => (
              <VStack key={i} textAlign="center">
                <Heading
                  fontSize="2rem"
                  fontWeight="700"
                  css={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.number}
                </Heading>
                <Text color="#a0a0a0" fontSize="0.9rem" mt={2}>
                  {stat.label}
                </Text>
              </VStack>
            ))}
          </Flex>
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

          {splashContent.features.map((feature, index) => (
            <FeatureShowcase
              key={index}
              badge={feature.badge}
              title={feature.title}
              description={feature.description}
              highlights={feature.highlights}
              index={index}
            />
          ))}
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
          _hover={{ bg: 'var(--color-blue-hover)' }}
        >
          {splashContent.cta.primaryButton}
        </Button>
      </Box>

      {/* Footer */}
      <Box
        px="5%"
        py={12}
        borderTop="1px solid rgba(255, 255, 255, 0.1)"
      >
        <VStack gap={6}>
          {/* Links */}
          <HStack
            gap={{ base: 4, md: 8 }}
            flexWrap="wrap"
            justify="center"
            fontSize="0.9rem"
          >
            <Text
              as="a"
              href="/terms"
              color="#888"
              transition="color 0.2s"
              _hover={{ color: '#667eea', textDecoration: 'none' }}
              cursor="pointer"
            >
              Terms of Service
            </Text>
            <Text color="#444">•</Text>
            <Text
              as="a"
              href="/privacy"
              color="#888"
              transition="color 0.2s"
              _hover={{ color: '#667eea', textDecoration: 'none' }}
              cursor="pointer"
            >
              Privacy Policy
            </Text>
            <Text color="#444">•</Text>
            <Text
              as="a"
              href="/cookies"
              color="#888"
              transition="color 0.2s"
              _hover={{ color: '#667eea', textDecoration: 'none' }}
              cursor="pointer"
            >
              Cookie Policy
            </Text>
            <Text color="#444">•</Text>
            <Text
              as="a"
              href="mailto:hello@breathworklabs.com"
              color="#888"
              transition="color 0.2s"
              _hover={{ color: '#667eea', textDecoration: 'none' }}
              cursor="pointer"
            >
              Contact Us
            </Text>
          </HStack>

          {/* Copyright */}
          <Text color="#666" fontSize="0.85rem" textAlign="center">
            &copy; 2025 X Bookmark Manager. All rights reserved.
          </Text>
        </VStack>
      </Box>
    </Box>
  )
}

export default SplashPage
