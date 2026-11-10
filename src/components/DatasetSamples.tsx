import { ExternalLink } from 'lucide-react'
import samples from '../../public/assets/vision/samples.json'
import { datasets } from '../content/research-data'
import { Figure } from './Primitives'

const models = [
  { id: 'global', model: 'RF-DETR-Large', sampleId: 'global-2', dataset: datasets[1], purpose: 'Finds parts and fasteners in the global camera view.' },
  { id: 'local', model: 'RF-DETR-Small', sampleId: 'local-2', dataset: datasets[0], purpose: 'Locates the screwdriver and target screw in the tool camera view.' },
  { id: 'state', model: 'YOLOv11-Nano', sampleId: 'state-2', dataset: datasets[2], purpose: 'Classifies tool contact; this example is labelled aligned.' },
]

export function DatasetSamples() {
  return <div className="dataset-samples"><table className="perception-matrix">
    <caption className="sr-only">Raw and labelled samples for the three perception models</caption>
    <thead><tr><th scope="col">Vision model</th><th scope="col">Raw image</th><th scope="col">Labelled image</th></tr></thead>
    <tbody>{models.map((model) => {
      const sample = samples.find((item) => item.id === model.sampleId)!
      return <tr className="dataset-model sample-comparison" key={model.id}>
        <th scope="row" className="model-row-heading"><h3>{model.model}</h3><p>{model.purpose}</p><a href={model.dataset.href} target="_blank" rel="noreferrer">{model.dataset.label}<ExternalLink aria-hidden="true" /></a></th>
        <td data-view="Raw image"><Figure src={sample.raw} alt={`${model.model}: ${sample.label}, raw camera image`} caption="Raw image" contain /></td>
        <td data-view="Labelled image"><Figure src={sample.annotations ?? sample.raw} alt={`${model.model}: ${sample.label}, supplied dataset labels`} caption="Labelled image" imageLabel={sample.annotations ? undefined : sample.annotationClasses.join(' · ')} contain /></td>
      </tr>
    })}</tbody>
  </table></div>
}
