import { Analyzer } from '../handlers/log.handler';
import { createVersionAnalyzer } from './createVersion';
import { extendedBogeysAnalyzer } from './extendedBogeys';
import { optifineAnalyzer } from './optifine';

export const logAnalyzers: Analyzer[] = [
    createVersionAnalyzer,
    extendedBogeysAnalyzer,
    optifineAnalyzer,
];

export default logAnalyzers;
