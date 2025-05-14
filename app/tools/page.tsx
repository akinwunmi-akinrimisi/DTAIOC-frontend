import BasenameManager from "@/components/basename-manager"
import ContractTester from "@/components/contract-tester"

export default function ToolsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Developer Tools</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <BasenameManager />
        </div>

        <div>
          <ContractTester />
        </div>
      </div>
    </div>
  )
}
