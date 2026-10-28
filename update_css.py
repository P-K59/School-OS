import sys

file_path = 'app/student/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update main container
content = content.replace(
    '<div className="space-y-6">',
    '<div className="space-y-6 luxury-mesh-bg p-4 sm:p-6 lg:p-8 rounded-[2.5rem] min-h-[calc(100vh-2rem)] border border-white/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]">'
)

# 2. Update all light-glass classes
content = content.replace('className="light-glass ', 'className="glass-3d glass-3d-hover ')
content = content.replace('className="light-glass-glow ', 'className="glass-3d glass-3d-hover border-indigo-200 ')

# 3. Update tabs layout
old_tabs = '''        <div className="flex border-b border-slate-200">
          {[
            { id: 'CODING_LAB', label: 'Python Coding Sandbox', icon: Code2 },
            { id: 'ROBOTICS_SIM', label: 'Autonomous Rover Simulator (2D)', icon: Cpu },
            { id: 'COURSES', label: 'Curriculum & Video Labs', icon: BookOpen },
            { id: 'ACHIEVEMENTS', label: 'Achievements & Badges', icon: Trophy },
            { id: 'FEES_RECEIPTS', label: 'Fees & Digital Receipts', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-2 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>'''

new_tabs = '''        <div className="flex flex-wrap gap-3 pb-2 mb-4">
          {[
            { id: 'CODING_LAB', label: 'Python Sandbox', icon: Code2 },
            { id: 'ROBOTICS_SIM', label: 'Robotics Sim', icon: Cpu },
            { id: 'COURSES', label: 'Curriculum', icon: BookOpen },
            { id: 'ACHIEVEMENTS', label: 'Badges', icon: Trophy },
            { id: 'FEES_RECEIPTS', label: 'Fees & Receipts', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 translate-y-[-2px]'
                    : 'glass-3d text-slate-600 hover:text-indigo-700 hover:translate-y-[-2px]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>'''

content = content.replace(old_tabs, new_tabs)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated student page with 3D UI classes.')
