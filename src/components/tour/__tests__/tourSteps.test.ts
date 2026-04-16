import { describe, it, expect } from 'vitest'
import {
  tourSteps,
  getTourStep,
  getTourStepByIndex,
  getTourStepCount,
  isValidStepIndex,
} from '@/components/tour/tourSteps'

describe('tourSteps', () => {
  describe('tourSteps array', () => {
    it('should have at least 5 steps', () => {
      expect(tourSteps.length).toBeGreaterThanOrEqual(5)
    })

    it('should have unique step IDs', () => {
      const ids = tourSteps.map((step) => step.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have required properties for each step', () => {
      tourSteps.forEach((step) => {
        expect(step).toHaveProperty('id')
        expect(step).toHaveProperty('target')
        expect(step).toHaveProperty('title')
        expect(step).toHaveProperty('description')
        expect(typeof step.id).toBe('string')
        expect(typeof step.target).toBe('string')
        expect(typeof step.title).toBe('string')
        expect(typeof step.description).toBe('string')
      })
    })

    it('should have valid placement values', () => {
      const validPlacements = ['top', 'right', 'bottom', 'left', 'center']
      tourSteps.forEach((step) => {
        if (step.placement) {
          expect(validPlacements).toContain(step.placement)
        }
      })
    })

    it('should start with welcome step', () => {
      expect(tourSteps[0].id).toBe('welcome')
      expect(tourSteps[0].placement).toBe('center')
    })

    it('should end with complete step', () => {
      const lastStep = tourSteps[tourSteps.length - 1]
      expect(lastStep.id).toBe('complete')
      expect(lastStep.placement).toBe('center')
    })

    it('should have data-tour attribute selectors for middle steps', () => {
      // Skip first (welcome) and last (complete) steps
      const middleSteps = tourSteps.slice(1, -1)
      middleSteps.forEach((step) => {
        expect(step.target).toMatch(/\[data-tour=/)
      })
    })

    it('should have appropriate spotlight padding', () => {
      tourSteps.forEach((step) => {
        if (step.spotlightPadding !== undefined) {
          expect(step.spotlightPadding).toBeGreaterThanOrEqual(0)
          expect(step.spotlightPadding).toBeLessThanOrEqual(50)
        }
      })
    })
  })

  describe('getTourStep', () => {
    it('should return step by ID', () => {
      const welcomeStep = getTourStep('welcome')
      expect(welcomeStep).toBeDefined()
      expect(welcomeStep?.id).toBe('welcome')
    })

    it('should return undefined for non-existent ID', () => {
      const step = getTourStep('non-existent-step')
      expect(step).toBeUndefined()
    })

    it('should return correct step for all step IDs', () => {
      tourSteps.forEach((step) => {
        const foundStep = getTourStep(step.id)
        expect(foundStep).toBe(step)
      })
    })
  })

  describe('getTourStepByIndex', () => {
    it('should return step at index 0', () => {
      const step = getTourStepByIndex(0)
      expect(step).toBeDefined()
      expect(step?.id).toBe('welcome')
    })

    it('should return step at last index', () => {
      const lastIndex = tourSteps.length - 1
      const step = getTourStepByIndex(lastIndex)
      expect(step).toBeDefined()
      expect(step?.id).toBe('complete')
    })

    it('should return undefined for negative index', () => {
      const step = getTourStepByIndex(-1)
      expect(step).toBeUndefined()
    })

    it('should return undefined for out-of-bounds index', () => {
      const step = getTourStepByIndex(tourSteps.length)
      expect(step).toBeUndefined()
    })

    it('should return correct steps for all valid indices', () => {
      tourSteps.forEach((step, index) => {
        const foundStep = getTourStepByIndex(index)
        expect(foundStep).toBe(step)
      })
    })
  })

  describe('getTourStepCount', () => {
    it('should return the correct number of steps', () => {
      expect(getTourStepCount()).toBe(tourSteps.length)
    })

    it('should return a positive number', () => {
      expect(getTourStepCount()).toBeGreaterThan(0)
    })
  })

  describe('isValidStepIndex', () => {
    it('should return true for index 0', () => {
      expect(isValidStepIndex(0)).toBe(true)
    })

    it('should return true for last index', () => {
      const lastIndex = tourSteps.length - 1
      expect(isValidStepIndex(lastIndex)).toBe(true)
    })

    it('should return false for negative index', () => {
      expect(isValidStepIndex(-1)).toBe(false)
      expect(isValidStepIndex(-10)).toBe(false)
    })

    it('should return false for index equal to length', () => {
      expect(isValidStepIndex(tourSteps.length)).toBe(false)
    })

    it('should return false for index greater than length', () => {
      expect(isValidStepIndex(tourSteps.length + 1)).toBe(false)
      expect(isValidStepIndex(999)).toBe(false)
    })

    it('should return true for all valid indices', () => {
      for (let i = 0; i < tourSteps.length; i++) {
        expect(isValidStepIndex(i)).toBe(true)
      }
    })
  })

  describe('tour step configuration', () => {
    it('should have search step', () => {
      const searchStep = getTourStep('search')
      expect(searchStep).toBeDefined()
      expect(searchStep?.target).toContain('search-bar')
    })

    it('should have filters step pointing to button', () => {
      const filtersStep = getTourStep('filters')
      expect(filtersStep).toBeDefined()
      expect(filtersStep?.target).toContain('filters-button')
    })

    it('should have views step', () => {
      const viewsStep = getTourStep('views')
      expect(viewsStep).toBeDefined()
      expect(viewsStep?.target).toContain('collections-sidebar')
    })

    it('should have bookmark-card step', () => {
      const bookmarkStep = getTourStep('bookmark-card')
      expect(bookmarkStep).toBeDefined()
      expect(bookmarkStep?.target).toContain('bookmark-card')
    })

    it('should have settings step with right placement', () => {
      const settingsStep = getTourStep('settings')
      expect(settingsStep).toBeDefined()
      expect(settingsStep?.placement).toBe('right')
      expect(settingsStep?.target).toContain('settings-button')
    })
  })

  describe('tour step actions', () => {
    it('should have beforeShow action for views step', () => {
      const viewsStep = getTourStep('views')
      expect(viewsStep?.actions?.beforeShow).toBeDefined()
      expect(typeof viewsStep?.actions?.beforeShow).toBe('function')
    })

    it('should not have actions for most steps', () => {
      const stepsWithoutActions = tourSteps.filter(
        (step) => !step.actions || (!step.actions.beforeShow && !step.actions.afterShow)
      )
      // Most steps should not need actions
      expect(stepsWithoutActions.length).toBeGreaterThan(tourSteps.length / 2)
    })
  })
})
