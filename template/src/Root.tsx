import {Composition} from 'remotion';
import {PV, DURATION} from './PV';

export const Root = () => (
  <Composition id="PV" component={PV} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
);
