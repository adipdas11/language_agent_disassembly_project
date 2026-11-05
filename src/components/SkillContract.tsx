import { skills } from '../content/research-data'

export function SkillContract({ id }: { id: string }) {
  const skill = skills.find((item) => item.id === `paper-${id}`)!
  return <div className="skill-contract"><p>{skill.arm}</p><dl>
    <div><dt>Sense</dt><dd>{skill.sensors.join(' · ')}</dd></div>
    <div><dt>Preconditions</dt><dd>{skill.preconditions.join(' · ')}</dd></div>
    <div><dt>Success</dt><dd>{skill.success}</dd></div>
    <div><dt>Recovery</dt><dd>{skill.recovery}</dd></div>
  </dl></div>
}
