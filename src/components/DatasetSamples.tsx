import { ExternalLink } from './ResearchIcons'
import collages from '../content/collage-samples.json'
import { datasets } from '../content/research-data'
import { sitePath } from '../lib/site-path'

const models = [
  { id: 'global' as const, model: 'RF-DETR-Large', name: 'Scene-level perception', dataset: datasets[1], purpose: 'Components, fasteners and holes across the HDD, mini PC and laptop.', note: 'Supplied segmentation masks · global camera', colour: 'blue' },
  { id: 'local' as const, model: 'RF-DETR-Small', name: 'Local fastener perception', dataset: datasets[0], purpose: 'The screw, screw head, tool head and hole used for close-range localisation.', note: 'Supplied segmentation masks · tool camera', colour: 'teal' },
  { id: 'classification' as const, model: 'YOLOv11-Nano', name: 'State verification', dataset: datasets[2], purpose: 'Aligned and misaligned contact examples. The model also recognises component removal.', note: 'Classification samples · camera images', colour: 'violet' },
]

const categoryName = (category: string) => ({ hdd: 'HDD', mini_pc: 'Mini PC', laptop: 'Laptop' }[category] ?? category.replaceAll('_', ' '))

export function DatasetSamples() {
  return <div className="dataset-collages">
    {models.map(model => <article className={`collage-model collage-${model.colour}`} key={model.id} aria-labelledby={`collage-${model.id}-title`}>
      <header className="collage-description">
        <span className="collage-purpose">{model.name}</span>
        <h3 id={`collage-${model.id}-title`}>{model.model}</h3>
        <p>{model.purpose}</p>
        <a href={model.dataset.href} target="_blank" rel="noreferrer">{model.dataset.label}<ExternalLink aria-hidden="true" /></a>
      </header>
      <figure className={`collage-figure collage-${model.id}`}>
        <div className="collage-grid" aria-label={`${model.model}: 10 representative dataset images in two rows`}>
          {collages[model.id].slice(0, 10).map((sample, i) => <div className="collage-tile" tabIndex={0} key={sample.src}>
            <img src={sitePath(sample.src)} width={sample.width} height={sample.height} loading="lazy" alt={`${model.model}, sample ${i + 1}: ${model.id === 'classification' ? categoryName(sample.category) : model.id === 'global' ? `${categoryName(sample.category)} with supplied segmentation masks` : 'tool-camera fastener with supplied segmentation masks'}`} />
          </div>)}
        </div>
        <figcaption>{model.note}</figcaption>
      </figure>
    </article>)}
  </div>
}
