import { useState } from 'react'
import SearchBox from '../components/ui/SearchBox'
import MembersTable from '../components/documents/MembersTable'
import { teamMembers } from '../data/mockData'

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search members..."
          className="w-72"
        />
      </div>

      <MembersTable members={filteredMembers} />
    </div>
  )
}



