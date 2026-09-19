import { Alert, Linking } from 'react-native';

import {
  buildHtmlPreviewUrl,
  buildPagesOpenUrl,
  fetchRepoPages,
  findRepoIndexHtml,
} from './github';

export type OpenHtmlResult = 'opened' | 'not_found' | 'error';

type ResolveArgs = {
  token: string;
  owner: string;
  name: string;
  defaultBranch: string;
  githubHtmlUrl: string;
};

/**
 * Resolves GitHub Pages or a repo index.html, then opens it.
 * Shows a Polish Alert when neither is available.
 */
export async function resolveAndOpenRepoHtml({
  token,
  owner,
  name,
  defaultBranch,
  githubHtmlUrl,
}: ResolveArgs): Promise<OpenHtmlResult> {
  try {
    const pages = await fetchRepoPages(token, owner, name);
    if (pages) {
      const url = buildPagesOpenUrl(pages, owner, name);
      await Linking.openURL(url);
      return 'opened';
    }

    const indexPath = await findRepoIndexHtml(
      token,
      owner,
      name,
      defaultBranch
    );
    if (indexPath) {
      const url = buildHtmlPreviewUrl(owner, name, defaultBranch, indexPath);
      await Linking.openURL(url);
      return 'opened';
    }

    Alert.alert(
      'Brak HTML / Pages',
      'To repozytorium nie ma włączonych GitHub Pages ani pliku index.html (ani docs/index.html / index.htm).',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Otwórz na GitHubie',
          onPress: () => {
            void Linking.openURL(githubHtmlUrl);
          },
        },
      ]
    );
    return 'not_found';
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Nie udało się otworzyć HTML / Pages.';
    Alert.alert('Błąd', message, [
      { text: 'OK', style: 'cancel' },
      {
        text: 'Otwórz na GitHubie',
        onPress: () => {
          void Linking.openURL(githubHtmlUrl);
        },
      },
    ]);
    return 'error';
  }
}
