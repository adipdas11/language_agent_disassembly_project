import { memo } from 'react'
import samples from '../../public/assets/vision/samples.json'

type Detection = { label: string; confidence: number; box?: number[] }

// Draw the supplied predictions at display resolution instead of shrinking
// the thin outlines and tiny labels baked into the exported preview images.
export const DetectionOverlay = memo(function DetectionOverlay({ sampleId, visible }: { sampleId: string; visible: boolean }) {
  const sample = samples.find((item) => item.id === sampleId)!
  const size = sampleId.startsWith('global') ? 1088 : 640
  const boxes = (sample.detections as Detection[]).filter((item): item is Detection & { box: number[] } => !!item.box)
  const classification = boxes.length ? null : sample.detections.reduce((best, item) => item.confidence > best.confidence ? item : best)
  return <div className={`flow-detection-layer ${visible ? 'visible' : ''}`} role="img" aria-label={`${sample.model} prediction`}>
    {boxes.length > 0 && <svg className="detection-boxes" viewBox="0 0 100 100" aria-hidden="true">{boxes.map((item, index) => {
      const box = item.box!
      return <rect key={index} className={index === 0 ? 'primary-detection' : ''} x={box[0] / size * 100} y={box[1] / size * 100} width={(box[2] - box[0]) / size * 100} height={(box[3] - box[1]) / size * 100} />
    })}</svg>}
    {boxes.filter((item, index) => index === 0 || (sampleId.startsWith('local') && item.label === 'screw')).map((item) => <span key={item.label} className="detection-label" style={{ left: `${Math.min(60, item.box![0] / size * 100)}%`, top: `${Math.min(83, item.box![1] / size * 100)}%` }}>{item.label.replaceAll('_', ' ')} <b>{(item.confidence * 100).toFixed(0)}%</b></span>)}
    {classification && <span className="classification-label">{classification.label}<b>{(classification.confidence * 100).toFixed(1)}%</b></span>}
  </div>
})
