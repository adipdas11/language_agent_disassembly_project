import { ExternalLink } from 'lucide-react'
import samples from '../../public/assets/vision/samples.json'
import { datasets } from '../content/research-data'
import { Figure } from './Primitives'

const groups = [
  { id: 'global', label: 'Global scene', model: 'RF-DETR-Large', dataset: datasets[1], purpose: 'Fixed-camera RGB identifies components, holders, and fasteners to populate the object state.' },
  { id: 'local', label: 'Tool camera', model: 'RF-DETR-Small', dataset: datasets[0], purpose: 'Tool-mounted RGB localises the screwdriver and screw centres before contact.' },
  { id: 'state', label: 'Contact verification', model: 'YOLOv11-Nano', dataset: datasets[2], purpose: 'Close-up contact images classify alignment before the system commits an action outcome.' },
]
// The architecture already shows these examples; keep this gallery additional.
const architectureSamples = new Set(['global-1', 'local-1', 'state-2'])

export function DatasetSamples() {
  return <div className="dataset-samples expanded-datasets">{groups.map((group) => <article key={group.id} className="dataset-model" aria-labelledby={`dataset-model-${group.id}`}>
    <header className="dataset-model-heading"><div><span className="eyebrow">{group.label}</span><h3 id={`dataset-model-${group.id}`}>{group.model}</h3><p>{group.purpose}</p></div><a href={group.dataset.href} target="_blank" rel="noreferrer">{group.dataset.label}<ExternalLink aria-hidden="true" /></a></header>
    <div className="sample-comparisons">{samples.filter((sample) => sample.group === group.id && !architectureSamples.has(sample.id)).map((sample) => <article className="sample-comparison" key={sample.id} aria-label={`${sample.label} comparison`}>
      <h4>{sample.label}</h4>
      <div className="sample-image-grid two-images">
        <Figure src={sample.raw} alt={`${sample.label}: original camera image`} caption="Raw image" contain />
        <Figure src={sample.annotations ?? sample.raw} alt={`${sample.label}: supplied dataset labels`} caption="Labelled image" imageLabel={sample.annotations ? undefined : sample.annotationClasses.join(' · ')} contain />
      </div>
    </article>)}</div>
  </article>)}</div>
}
