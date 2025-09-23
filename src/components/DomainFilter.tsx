import { useMemo } from 'react'
import { LuGlobe } from 'react-icons/lu'
import { useBookmarkSelectors } from '../hooks/selectors/useBookmarkSelectors'
import { useFilterReset } from '../utils/filterUtils'
import { GenericFilter } from './filters/GenericFilter'

const DomainFilter = () => {
  const { domainFilter, setDomainFilter, filterOptions } = useBookmarkSelectors()
  const resetFilters = useFilterReset()

  // Use cached domains from the store
  const domains = useMemo(() => {
    return filterOptions.domains.map(domain => ({
      label: domain,
      value: domain
    }))
  }, [filterOptions.domains])

  return (
    <GenericFilter
      type="domain"
      label="Domain"
      icon={LuGlobe}
      placeholder="Search by domain..."
      value={domainFilter}
      onChange={setDomainFilter}
      onReset={resetFilters}
      options={domains}
      emptyMessage="No domains found"
    />
  )
}

export default DomainFilter