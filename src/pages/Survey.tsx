import { ClipboardList, ShieldAlert } from "lucide-react";
import { useState } from "react";
import type { PageKey } from "../types";
import type { LearningMode, ReportedHistory, SurveyResponse } from "../types/cognitiveProfile";

const learningModes: Array<{ id: LearningMode; label: string }> = [
  { id: "visual", label: "Visual" },
  { id: "text", label: "Text" },
  { id: "audio", label: "Audio" },
  { id: "hands-on", label: "Hands-on" },
  { id: "examples", label: "Examples" },
  { id: "repetition", label: "Repetition" },
];

const historyOptions: Array<{ value: ReportedHistory; label: string }> = [
  { value: "none", label: "No" },
  { value: "suspected", label: "Suspected" },
  { value: "diagnosed", label: "Previously diagnosed" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

interface SurveyProps {
  initialResponse?: SurveyResponse;
  onComplete: (response: SurveyResponse) => Promise<void> | void;
  onNavigate: (page: PageKey) => void;
}

export function Survey({ initialResponse, onComplete, onNavigate }: SurveyProps) {
  const [response, setResponse] = useState<SurveyResponse>(
    initialResponse ?? {
      id: `survey-${Date.now()}`,
      completedAt: new Date().toISOString(),
      ageRange: "18-24",
      educationLevel: "Some college",
      primaryLanguage: "English",
      sleepQuality: 3,
      attentionDifficulties: 3,
      workingMemoryDifficulties: 3,
      readingStruggles: 2,
      mathStruggles: 2,
      spatialReasoningStruggles: 2,
      motivationLevel: 7,
      confidenceLevel: 7,
      dyslexiaHistory: "none",
      adhdHistory: "none",
      visionHearingIssues: 1,
      testAnxiety: 2,
      troubleRememberingInstructions: 2,
      troubleReadingNumbersSymbolsSigns: 2,
      troubleFollowingMultiStepTasks: 2,
      preferredLearningModes: ["visual", "examples"],
    },
  );

  function setField<K extends keyof SurveyResponse>(key: K, value: SurveyResponse[K]) {
    setResponse((current) => ({ ...current, [key]: value }));
  }

  function toggleLearningMode(mode: LearningMode) {
    setResponse((current) => {
      const exists = current.preferredLearningModes.includes(mode);
      return {
        ...current,
        preferredLearningModes: exists
          ? current.preferredLearningModes.filter((item) => item !== mode)
          : [...current.preferredLearningModes, mode],
      };
    });
  }

  async function submit() {
    await onComplete({
      ...response,
      id: response.id || `survey-${Date.now()}`,
      completedAt: new Date().toISOString(),
      preferredLearningModes: response.preferredLearningModes.length ? response.preferredLearningModes : ["examples"],
    });
  }

  return (
    <div className="space-y-5">
      <section className="surface-gradient p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-pulse/15 p-3 text-pulse">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase text-white/50">Intake survey</p>
            <h1 className="mt-1 text-3xl font-black">Build your cognitive profile</h1>
            <p className="mt-2 text-sm leading-6 text-white/64">
              Your answers become low-to-medium confidence evidence. Game results strengthen or revise the profile over time.
            </p>
          </div>
        </div>
      </section>

      <SafetyNote />

      <section className="surface p-5">
        <h2 className="text-2xl font-black">Background</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Age range"
            value={response.ageRange}
            options={["Under 13", "13-17", "18-24", "25-34", "35-44", "45-54", "55+"]}
            onChange={(value) => setField("ageRange", value)}
          />
          <SelectField
            label="Education level"
            value={response.educationLevel}
            options={["Middle school", "High school", "Some college", "College graduate", "Graduate school", "Other"]}
            onChange={(value) => setField("educationLevel", value)}
          />
          <TextField label="Primary language" value={response.primaryLanguage} onChange={(value) => setField("primaryLanguage", value)} />
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="text-2xl font-black">Current experience</h2>
        <div className="mt-4 space-y-4">
          <ScaleField label="Sleep quality" minLabel="Poor" maxLabel="Great" value={response.sleepQuality} max={5} onChange={(value) => setField("sleepQuality", value)} />
          <ScaleField label="Attention difficulties" minLabel="Rare" maxLabel="Often" value={response.attentionDifficulties} max={5} onChange={(value) => setField("attentionDifficulties", value)} />
          <ScaleField label="Working memory difficulties" minLabel="Rare" maxLabel="Often" value={response.workingMemoryDifficulties} max={5} onChange={(value) => setField("workingMemoryDifficulties", value)} />
          <ScaleField label="Reading struggles" minLabel="Rare" maxLabel="Often" value={response.readingStruggles} max={5} onChange={(value) => setField("readingStruggles", value)} />
          <ScaleField label="Math struggles" minLabel="Rare" maxLabel="Often" value={response.mathStruggles} max={5} onChange={(value) => setField("mathStruggles", value)} />
          <ScaleField label="Spatial reasoning struggles" minLabel="Rare" maxLabel="Often" value={response.spatialReasoningStruggles} max={5} onChange={(value) => setField("spatialReasoningStruggles", value)} />
          <ScaleField label="Motivation level" minLabel="Low" maxLabel="High" value={response.motivationLevel} max={10} onChange={(value) => setField("motivationLevel", value)} />
          <ScaleField label="Confidence level" minLabel="Low" maxLabel="High" value={response.confidenceLevel} max={10} onChange={(value) => setField("confidenceLevel", value)} />
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="text-2xl font-black">Learning-struggle flags</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SelectField
            label="History of dyslexia diagnosis or suspected dyslexia"
            value={historyOptions.find((option) => option.value === response.dyslexiaHistory)?.label ?? "No"}
            options={historyOptions.map((option) => option.label)}
            onChange={(value) => setField("dyslexiaHistory", historyOptions.find((option) => option.label === value)?.value ?? "none")}
          />
          <SelectField
            label="History of ADHD diagnosis or suspected ADHD"
            value={historyOptions.find((option) => option.value === response.adhdHistory)?.label ?? "No"}
            options={historyOptions.map((option) => option.label)}
            onChange={(value) => setField("adhdHistory", historyOptions.find((option) => option.label === value)?.value ?? "none")}
          />
        </div>
        <div className="mt-4 space-y-4">
          <ScaleField label="Vision/hearing issues" minLabel="None" maxLabel="Significant" value={response.visionHearingIssues} max={5} onChange={(value) => setField("visionHearingIssues", value)} />
          <ScaleField label="Anxiety during tests" minLabel="Low" maxLabel="High" value={response.testAnxiety} max={5} onChange={(value) => setField("testAnxiety", value)} />
          <ScaleField label="Trouble remembering instructions" minLabel="Rare" maxLabel="Often" value={response.troubleRememberingInstructions} max={5} onChange={(value) => setField("troubleRememberingInstructions", value)} />
          <ScaleField label="Trouble reading numbers, symbols, or negative signs" minLabel="Rare" maxLabel="Often" value={response.troubleReadingNumbersSymbolsSigns} max={5} onChange={(value) => setField("troubleReadingNumbersSymbolsSigns", value)} />
          <ScaleField label="Trouble following multi-step tasks" minLabel="Rare" maxLabel="Often" value={response.troubleFollowingMultiStepTasks} max={5} onChange={(value) => setField("troubleFollowingMultiStepTasks", value)} />
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="text-2xl font-black">Preferred learning mode</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {learningModes.map((mode) => {
            const active = response.preferredLearningModes.includes(mode.id);

            return (
              <button
                key={mode.id}
                type="button"
                className={`rounded-lg border p-4 text-left font-black transition ${
                  active ? "border-pulse/60 bg-pulse/12 text-pulse" : "border-white/10 bg-white/7 text-white/70"
                }`}
                onClick={() => toggleLearningMode(mode.id)}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <button className="btn-secondary" type="button" onClick={() => onNavigate("profile")}>
          Cancel
        </button>
        <button className="btn-primary" type="button" onClick={submit}>
          Save Cognitive Profile
        </button>
      </div>
    </div>
  );
}

function SafetyNote() {
  return (
    <section className="rounded-lg border border-solar/25 bg-solar/10 p-4">
      <div className="flex gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 flex-none text-solar" />
        <div className="text-sm leading-6 text-white/70">
          <p className="font-black text-white">ConceptIQ is not a medical diagnostic tool.</p>
          <p>This profile estimates learning patterns and possible bottlenecks. For medical or learning-disability diagnosis, consult a qualified professional.</p>
        </div>
      </div>
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block rounded-lg border border-white/10 bg-white/7 p-4">
      <span className="text-sm font-bold text-white/50">{label}</span>
      <input
        className="mt-2 w-full rounded-lg border border-white/10 bg-ink/40 px-3 py-3 font-bold outline-none focus:border-pulse/60"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-lg border border-white/10 bg-white/7 p-4">
      <span className="text-sm font-bold text-white/50">{label}</span>
      <select
        className="mt-2 w-full rounded-lg border border-white/10 bg-ink/80 px-3 py-3 font-bold outline-none focus:border-pulse/60"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ScaleField({
  label,
  minLabel,
  maxLabel,
  value,
  max,
  onChange,
}: {
  label: string;
  minLabel: string;
  maxLabel: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-lg border border-white/10 bg-white/7 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-black">{label}</span>
        <span className="rounded-full bg-pulse/14 px-3 py-1 text-sm font-black text-pulse">
          {value}/{max}
        </span>
      </div>
      <input
        className="mt-4 w-full accent-cyan-300"
        type="range"
        min={1}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="mt-2 flex justify-between text-xs font-bold uppercase text-white/42">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </label>
  );
}
