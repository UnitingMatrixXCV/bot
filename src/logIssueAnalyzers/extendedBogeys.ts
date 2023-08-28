import { Analyzer } from '../handlers/log.handler';

export const extendedBogeysAnalyzer: Analyzer = async (log) => {
    if (!log.mods) return null;

    const matchesExtendedBogeys = log.mods
        ? log.mods.has('extendedbogeys')
        : log.content.match(
              /NoSuchMethodError: 'com\.jozufozu\.flywheel\.util\.transform\.Transform\[\]/
          );
    const matchesCreate = log.mods
        ? log.mods.get('create') == '0.5.1.b'
        : log.content.match(/create-(.)+-0\.5\.1\.b/);
    const matchesSNR = log.mods.get('railways')?.includes('1.5.0');
    if (matchesExtendedBogeys && matchesCreate && matchesSNR) {
        return {
            name: 'Extended Bogeys',
            value: "Extended Bogeys has not yet updated to work with `0.5.1c/d`. Please downgrade to `0.5.1b`. And downgrade Steam 'n' Rails.",
        };
    }
    return null;
};
