import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Settings2, 
  Copy, 
  Share2, 
  Save, 
  ArrowRight, 
  ChevronLeft, 
  Zap, 
  Sliders, 
  MessageSquare, 
  Layers,
  Repeat,
  CheckCircle2,
  ShieldAlert,
  Loader2
} from 'lucide-react';

/** * CONSOLIDATED ENGINE LOGIC
 * Consolidating engine modules to ensure a functional build in this environment.
 */

// 1. Initial Data & Constants
const ALLOWED_VALUES = {
  intent_type: ['create', 'analyze', 'transform', 'extract', 'plan', 'solve'],
  task_domain: ['business', 'creative', 'technical', 'educational', 'marketing', 'personal'],
  output_type: ['text', 'list', 'table', 'code', 'outline', 'json', 'markdown', 'report'],
  tone: ['professional', 'casual', 'technical', 'friendly', 'authoritative', 'creative', 'neutral'],
  detail_level: ['brief', 'standard', 'comprehensive'],
  complexity_tier: ['free', 'pro', 'enterprise']
};

const TIER_LABELS = {
  free: 'Gemini Fast',
  pro: 'GPT-4',
  enterprise: 'OPUS-4'
};

const DEFAULT_VALUES = {
  intent_type: 'create',
  task_domain: 'business',
  output_type: 'text',
  tone: 'professional',
  role: '', // Changed to empty string to trigger Auto-Role logic correctly
  task_description: '',
  context_provided: '',
  constraints: [],
  examples_included: false,
  example_text: '',
  detail_level: 'standard',
  target_audience: 'general audience',
  complexity_tier: 'free',
  custom_instructions: '',
  multi_step_enabled: false,
  chain_of_thought: false,
  output_length_target: null
};

// ROLE_MAP Matrix 
const ROLE_MAP = {
  "create": {
    "business": "Expert Business Content Creator",
    "creative": "Creative Writing Specialist",
    "technical": "Technical Documentation Writer",
    "educational": "Educational Content Developer",
    "marketing": "Marketing Copywriter",
    "personal": "Personal Writing Assistant"
  },
  "analyze": {
    "business": "Business Analyst",
    "creative": "Creative Critic and Analyst",
    "technical": "Technical Systems Analyst",
    "educational": "Learning Assessment Specialist",
    "marketing": "Marketing Data Analyst",
    "personal": "Personal Development Coach"
  },
  "transform": {
    "business": "Business Process Optimizer",
    "creative": "Content Transformation Specialist",
    "technical": "Code Refactoring Expert",
    "educational": "Curriculum Adaptation Specialist",
    "marketing": "Brand Messaging Strategist",
    "personal": "Lifestyle Change Consultant"
  },
  "extract": {
    "business": "Business Intelligence Specialist",
    "creative": "Content Extraction Expert",
    "technical": "Data Mining Engineer",
    "educational": "Key Concept Identifier",
    "marketing": "Market Research Analyst",
    "personal": "Information Organizer"
  },
  "plan": {
    "business": "Strategic Business Planner",
    "creative": "Creative Project Manager",
    "technical": "Technical Architect",
    "educational": "Learning Path Designer",
    "marketing": "Campaign Strategy Director",
    "personal": "Goal Setting Coach"
  },
  "solve": {
    "business": "Business Problem Solver",
    "creative": "Creative Solutions Consultant",
    "technical": "Technical Troubleshooting Expert",
    "educational": "Learning Challenge Specialist",
    "marketing": "Marketing Challenge Solver",
    "personal": "Personal Problem-Solving Coach"
  }
};

// 2. Logic Modules: Prompt Assembly 

const assemblePrompt = (input) => {
  // Auto-Role Generation Logic
  let role = input.role;
  if (role === "" || role === null) {
    role = ROLE_MAP[input.intent_type][input.task_domain];
  }
  
  // 1. ROLE_BLOCK
  const roleBlock = `[ROLE]\nAct as a ${role}.`;

  // 2. OBJECTIVE_BLOCK
  let objectiveText = `Your objective is to ${input.task_description}.`;
  if (input.chain_of_thought) objectiveText += " Please use a chain-of-thought approach, thinking step-by-step.";
  if (input.multi_step_enabled) objectiveText += " Break the execution into sequential steps.";
  const objectiveBlock = `[OBJECTIVE]\n${objectiveText}`;

  // 3. CONTEXT_BLOCK
  const contextText = input.context_provided || "No additional context provided.";
  const contextBlock = `[CONTEXT]\n${contextText}${input.examples_included ? `\n\nReference Example:\n${input.example_text}` : ""}`;

  // 4. CONSTRAINTS_BLOCK
  const constraintsList = [...(input.constraints || [])];
  if (input.custom_instructions) constraintsList.push(input.custom_instructions);
  if (input.output_length_target) constraintsList.push(`Target length: approximately ${input.output_length_target} words.`);
  constraintsList.push(`Tone requirement: ${input.tone}.`);
  constraintsList.push(`Detail level: ${input.detail_level}.`);
  
  const constraintsBlock = `[CONSTRAINTS]\n${constraintsList.map(c => `- ${c}`).join('\n')}`;

  // 5. OUTPUT_FORMAT_BLOCK
  const outputFormatBlock = `[OUTPUT FORMAT]\nProvide the final response strictly in ${input.output_type} format.`;

  // Join the immutable 5-block sequence 
  return [roleBlock, objectiveBlock, contextBlock, constraintsBlock, outputFormatBlock].join('\n\n');
};

const applyFallbacks = (input) => {
  if (!input.task_description || input.task_description.trim().length === 0) {
    throw new Error("Task description required");
  }
  const sanitized = { ...DEFAULT_VALUES, ...input };
  
  if (sanitized.complexity_tier === "free") {
    sanitized.chain_of_thought = false;
    sanitized.multi_step_enabled = false;
    sanitized.custom_instructions = "";
    sanitized.output_length_target = null;
  } else if (sanitized.complexity_tier === "pro") {
    sanitized.chain_of_thought = false;
  }
  
  return sanitized;
};

const generateMetadata = async (input) => {
  const inputValuesString = JSON.stringify(input);
  const msgUint8 = new TextEncoder().encode(inputValuesString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    version_id: crypto.randomUUID(),
    created_timestamp: new Date().toISOString(),
    input_hash: hashHex,
    template_version: "4.1", // Incremented for Role Construction Logic update
    engine_version: "1.1.0"
  };
};

// 3. Main Orchestrator
const generatePrompt = async (raw_input) => {
  const input = applyFallbacks(raw_input);
  const metadata = await generateMetadata(input);
  const prompt = assemblePrompt(input);

  return {
    prompt,
    metadata,
    input_used: input
  };
};

// --- UI Components ---

const Header = ({ step, setStep }) => (
  <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
        S
      </div>
      <span className="font-bold text-xl text-gray-900 tracking-tight">Stitch</span>
    </div>
    
    <div className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-1 py-1">
      {['Input', 'Engine', 'Output'].map((label, idx) => {
        const isActive = step === idx + 1;
        const isPast = step > idx + 1;
        return (
          <div 
            key={label}
            onClick={() => step > idx + 1 ? setStep(idx + 1) : null}
            className={`px-3 py-1.5 rounded-full transition-all duration-300 ${
              isActive 
                ? 'bg-white text-blue-600 shadow-sm' 
                : isPast 
                  ? 'text-gray-800 cursor-pointer hover:bg-gray-200' 
                  : 'text-gray-400'
            }`}
          >
            {label}
          </div>
        );
      })}
    </div>
  </header>
);

const ScreenInput = ({ data, updateData, onNext }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-gray-900">What's your goal?</h1>
      <p className="text-gray-500">Describe the task. The engine will handle the role and structure.</p>
    </div>

    <div className="bg-white p-1 rounded-2xl border border-blue-100 shadow-xl shadow-blue-50/50">
      <textarea
        className="w-full h-40 p-4 text-lg bg-transparent border-none resize-none focus:ring-0 placeholder:text-gray-300 text-gray-800"
        placeholder="E.g., Summarize the key trends in renewable energy for 2024..."
        value={data.task_description}
        onChange={(e) => updateData({ task_description: e.target.value })}
        autoFocus
      />
      <div className="flex justify-between items-center px-4 pb-3">
        <span className="text-xs text-gray-400 font-medium">{data.task_description.length} chars</span>
        <button className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-blue-600 transition-colors">
          <MessageSquare size={18} />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 ml-1">Task Domain</label>
        <select 
          className="w-full p-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
          value={data.task_domain}
          onChange={(e) => updateData({ task_domain: e.target.value })}
        >
          {ALLOWED_VALUES.task_domain.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 ml-1">Intent</label>
        <select 
          className="w-full p-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
          value={data.intent_type}
          onChange={(e) => updateData({ intent_type: e.target.value })}
        >
          {ALLOWED_VALUES.intent_type.map(i => <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>)}
        </select>
      </div>
    </div>

    <div className="pt-4">
      <button 
        onClick={onNext}
        disabled={data.task_description.length < 10}
        className="w-full group bg-gray-900 hover:bg-blue-600 text-white p-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        Configure Engine
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
);

const ScreenEngine = ({ data, updateData, onGenerate, onBack }) => (
  <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Settings2 className="text-blue-600" />
        Prompt Engine
      </h1>
      <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-widest">
        Tier: {TIER_LABELS[data.complexity_tier]}
      </span>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5 space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Output Format</label>
        <div className="grid grid-cols-4 gap-2">
          {ALLOWED_VALUES.output_type.map((type) => (
            <button
              key={type}
              onClick={() => updateData({ output_type: type })}
              className={`py-2 px-1 rounded-lg text-xs font-medium capitalize transition-all ${
                data.output_type === type ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-600 border border-transparent'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Tone</label>
          <select 
            className="w-full p-2.5 bg-gray-50 border-none rounded-lg text-sm font-medium"
            value={data.tone}
            onChange={(e) => updateData({ tone: e.target.value })}
          >
            {ALLOWED_VALUES.tone.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Detail</label>
          <select 
            className="w-full p-2.5 bg-gray-50 border-none rounded-lg text-sm font-medium"
            value={data.detail_level}
            onChange={(e) => updateData({ detail_level: e.target.value })}
          >
            {ALLOWED_VALUES.detail_level.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t border-gray-50 mt-4">
        {[
          { key: 'chain_of_thought', label: 'Chain of Thought', desc: 'Show step-by-step logic', tierReq: 'enterprise' },
          { key: 'multi_step_enabled', label: 'Multi-Step Process', desc: 'Sequential execution', tierReq: 'pro' }
        ].map(feat => {
          const isGated = feat.tierReq === 'enterprise' 
            ? data.complexity_tier !== 'enterprise'
            : (data.complexity_tier === 'free');
            
          return (
            <div key={feat.key} className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  {feat.label}
                  {isGated && <ShieldAlert size={14} className="text-orange-400" />}
                </span>
                <span className="text-xs text-gray-500">{feat.desc}</span>
              </div>
              <button 
                disabled={isGated}
                onClick={() => updateData({ [feat.key]: !data[feat.key] })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${data[feat.key] ? 'bg-blue-600' : 'bg-gray-300'} ${isGated ? 'opacity-40' : ''}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${data[feat.key] ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>

    <div className="flex gap-3 pt-4">
      <button onClick={onBack} className="px-6 py-4 rounded-xl font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
        <ChevronLeft size={20} />
      </button>
      <button onClick={onGenerate} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
        Generate Prompt <Sparkles size={20} />
      </button>
    </div>
  </div>
);

const ScreenOutput = ({ output, onBack }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(output.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 space-y-5 pb-8">
       <div className="text-center space-y-1 py-2">
         <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
           <CheckCircle2 size={24} />
         </div>
         <h1 className="text-2xl font-bold text-gray-900">Stitched Successfully</h1>
         <p className="text-gray-500 text-sm">Version: {output.metadata.template_version} | ID: {output.metadata.version_id.substring(0,8)}</p>
       </div>

       <div className="bg-gray-900 rounded-2xl p-1 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-8 bg-gray-800 flex items-center px-4 justify-between">
             <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"/><div className="w-2.5 h-2.5 rounded-full bg-green-500"/>
             </div>
             <span className="text-[10px] text-gray-500 font-mono">{output.metadata.input_hash.substring(0,12)}</span>
          </div>
          <div className="mt-8 p-6 max-h-[50vh] overflow-y-auto">
            <pre className="text-gray-300 font-mono text-xs md:text-sm whitespace-pre-wrap">{output.prompt}</pre>
          </div>
          <div className="absolute bottom-4 right-4">
            <button onClick={handleCopy} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700">
              {copied ? <CheckCircle2 size={16}/> : <Copy size={16}/>} {copied ? 'Copied' : 'Copy Prompt'}
            </button>
          </div>
       </div>

       <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4">
          <div className="p-2 bg-white rounded-lg text-blue-600 self-start"><Zap size={20} fill="currentColor" /></div>
          <div>
             <h4 className="text-sm font-bold text-blue-900">Tier Optimization: {TIER_LABELS[output.input_used.complexity_tier].toUpperCase()}</h4>
             <p className="text-xs text-blue-700 mt-1">Engine applied {output.input_used.detail_level} detail levels and calibrated the tone.</p>
          </div>
       </div>

       <button onClick={onBack} className="w-full text-gray-400 hover:text-gray-600 text-sm font-medium py-4 flex items-center justify-center gap-2">
         <Repeat size={14} /> New Project
       </button>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState(null);
  
  const [data, setData] = useState({
    ...DEFAULT_VALUES,
    task_description: ''
  });

  const updateData = (newData) => setData(prev => ({ ...prev, ...newData }));

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePrompt(data);
      setOutput(result);
      setStep(3);
    } catch (err) {
      console.error("Generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4 font-sans text-gray-900">
      <div className="w-full max-w-md bg-white h-[85vh] max-h-[900px] rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative border-[8px] border-white">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 z-50">
           <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        <Header step={step} setStep={setStep} />

        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 animate-pulse">
               <div className="relative">
                  <Loader2 size={48} className="text-blue-600 animate-spin" />
                  <Sparkles size={20} className="text-blue-400 absolute -top-1 -right-1" />
               </div>
               <div className="text-center">
                  <h3 className="font-bold text-gray-900">Stitching Prompt...</h3>
                  <p className="text-sm text-gray-500">Executing pipeline v1.1.0</p>
               </div>
            </div>
          ) : (
            <>
              {step === 1 && <ScreenInput data={data} updateData={updateData} onNext={() => setStep(2)} />}
              {step === 2 && <ScreenEngine data={data} updateData={updateData} onGenerate={handleGenerate} onBack={() => setStep(1)} />}
              {step === 3 && output && <ScreenOutput output={output} onBack={() => { setOutput(null); setStep(1); }} />}
            </>
          )}
        </main>

        {step < 3 && !isGenerating && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white border border-gray-100 shadow-xl rounded-full px-2 py-1 flex gap-1 z-50 scale-90">
             {['free', 'pro', 'enterprise'].map(t => (
               <button key={t} onClick={() => updateData({ complexity_tier: t })} className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all ${data.complexity_tier === t ? 'bg-gray-900 text-white' : 'text-gray-400'}`}>
                 {TIER_LABELS[t].toUpperCase()}
               </button>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}