import { Analyzer } from '../handlers/log.handler';

export const createVersionAnalyzer: Analyzer = async (log) => {
    const matchesCreate = log.mods
        ? log.mods.get('create') == '0.5.1.b'
        : log.content.match(/create-(.)+-0\.5\.1\.b/);
    if (!log.mods) return null;
    const matchesSNR = log.mods.get('railways')?.includes('1.5.0');
    if (matchesCreate && matchesSNR) {
        return {
            name: 'Incompatible with Create 0.5.1b',
            value: "Create: Steam 'n' Rails `1.5.0` is incompatible with `Create 0.5.1b`. Upgrade to `Create 0.5.1c` or downgrade Steam 'n' Rails.",
        };
    }
    return null;
};
