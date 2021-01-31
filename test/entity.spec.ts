import './setupAndTearDown';
import { testGraphql } from './db';
import { asAdmin, asUser } from './testUtils';
import { gql } from '../src/graphqlProtocol/util';

describe('entity', () => {
  describe('mutation', () => {
    it('should accept inputs', async () => {
      const result = await testGraphql(
        gql`
          mutation saveWebsite {
            saveWebsite(
              input: {
                website: {
                  url: "https://thebestplacetocode.dev/"
                  category: CODING
                }
              }
            ) {
              website {
                id
                url
                category
                isSecure
                createdBy
                profileByCreatedBy {
                  id
                  username
                }
              }
            }
          }
        `,
        asUser(95),
      );

      expect(result).toMatchSnapshot();
    });

    const websiteCache = {};

    it('should use defaults', async () => {
      const result = await testGraphql(
        gql`
          mutation saveWebsite {
            saveWebsite(
              input: { website: { url: "https://example.com/path/index.html" } }
            ) {
              website {
                id
                nodeId
                url
                category
                isSecure
                createdBy
                profileByCreatedBy {
                  id
                  username
                }
              }
            }
          }
        `,
        asUser(98),
      );

      websiteCache['example-98'] = result.data.saveWebsite.website;

      expect(result).toMatchSnapshot();
    });

    it('should work with zero-attribute mutations', async () => {
      const result = await testGraphql(
        gql`
          mutation visitWebsiteById($id: ID!) {
            visitWebsiteById(input: { id: $id }) {
              website {
                id
                url
                category
                isSecure
                createdBy
                visitCount
                profileByCreatedBy {
                  id
                  username
                }
              }
            }
          }
        `,
        asUser(98),
        {
          id: websiteCache['example-98'].id,
        },
      );

      expect(result).toMatchSnapshot();
    });

    it('should work a pre processor', async () => {
      const result = await testGraphql(
        gql`
          mutation saveWebsite {
            saveWebsite(input: { website: { url: "I'm feeling lucky!" } }) {
              website {
                id
                nodeId
                url
                category
                isSecure
                createdBy
                profileByCreatedBy {
                  id
                  username
                }
              }
            }
          }
        `,
        asUser(98),
      );

      expect(result).toMatchSnapshot();
    });

    it('should use validators', async () => {
      const result = await testGraphql(
        gql`
          mutation saveWebsite {
            saveWebsite(
              input: { website: { url: "ftp://whatever.example.com" } }
            ) {
              website {
                id
                nodeId
                url
                category
                isSecure
                createdBy
                profileByCreatedBy {
                  id
                  username
                }
              }
            }
          }
        `,
        asUser(98),
      );

      expect(result).toMatchSnapshot();
    });

    it('should work with nodeId', async () => {
      const result = await testGraphql(
        gql`
          mutation visitWebsite($nodeId: ID!) {
            visitWebsite(input: { nodeId: $nodeId }) {
              website {
                id
                url
                category
                isSecure
                createdBy
                visitCount
                profileByCreatedBy {
                  id
                  username
                }
              }
            }
          }
        `,
        asUser(98),
        {
          nodeId: websiteCache['example-98'].nodeId,
        },
      );

      expect(result).toMatchSnapshot();
    });

    it('should fail on incompatible nodeId', async () => {
      const result = await testGraphql(
        gql`
          mutation visitWebsite($nodeId: ID!) {
            visitWebsite(input: { nodeId: $nodeId }) {
              website {
                id
                url
                category
                isSecure
                createdBy
                visitCount
                profileByCreatedBy {
                  id
                  username
                }
              }
            }
          }
        `,
        asUser(98),
        {
          nodeId: '123',
        },
      );

      expect(result).toMatchSnapshot();
    });

    it('should run multiple mutations in sequence', async () => {
      const result = await testGraphql(
        gql`
          mutation createLanguage {
            en: createLanguage(
              input: {
                language: {
                  name: "English"
                  nativeName: "English"
                  isoCode: "en"
                }
              }
            ) {
              language {
                id
              }
            }
            de: createLanguage(
              input: {
                language: {
                  name: "German"
                  nativeName: "Deutsch"
                  isoCode: "de"
                }
              }
            ) {
              language {
                id
              }
            }
            pl: createLanguage(
              input: {
                language: {
                  name: "Polish"
                  nativeName: "Polski"
                  isoCode: "pl"
                }
              }
            ) {
              language {
                id
              }
            }
          }
        `,
        asAdmin(),
      );

      expect(result).toMatchSnapshot();
    });

    it('should work with nested inputs', async () => {
      const result = await testGraphql(
        gql`
          mutation createtag {
            readLater: createTagNested(
              input: {
                tag: {
                  name: "Read Later"
                  languageByUniqueIsoCode: { isoCode: "en" }
                }
              }
            ) {
              tag {
                id
              }
            }
            learning: createTagNested(
              input: {
                tag: {
                  name: "Learning"
                  languageByUniqueIsoCode: { isoCode: "en" }
                }
              }
            ) {
              tag {
                id
              }
            }
            lernen: createTagNested(
              input: {
                tag: {
                  name: "Lernen"
                  languageByUniqueIsoCode: { isoCode: "de" }
                }
              }
            ) {
              tag {
                id
              }
            }
            nauka: createTagNested(
              input: {
                tag: {
                  name: "Nauka"
                  languageByUniqueIsoCode: { isoCode: "pl" }
                }
              }
            ) {
              tag {
                id
              }
            }
            fun: createTagNested(
              input: {
                tag: { name: "Fun", languageByUniqueIsoCode: { isoCode: "en" } }
              }
            ) {
              tag {
                id
              }
            }
          }
        `,
        asAdmin(),
      );

      expect(result).toMatchSnapshot();
    });

    it('should work with deep nested inputs', async () => {
      const result = await testGraphql(
        gql`
          mutation createWebsiteTagNested {
            first: createWebsiteTagNested(
              input: {
                websiteTag: {
                  websiteByUniqueUrl: {
                    url: "https://example.com/path/index.html"
                  }
                  tagByUniqueNameAndLanguage: {
                    name: "Fun"
                    languageByUniqueIsoCode: { isoCode: "en" }
                  }
                }
              }
            ) {
              websiteTag {
                id
              }
            }

            second: createWebsiteTagNested(
              input: {
                websiteTag: {
                  websiteByUniqueUrl: { url: "https://thebestplacetocode.dev/" }
                  tagByUniqueNameAndLanguage: {
                    name: "Nauka"
                    languageByUniqueName: { name: "Polish" }
                  }
                }
              }
            ) {
              websiteTag {
                id
              }
            }
          }
        `,
        asAdmin(),
      );

      expect(result).toMatchSnapshot();
    });

    it("should fail if nested inputs can't be resolved", async () => {
      const result = await testGraphql(
        gql`
          mutation createWebsiteTagNested {
            first: createWebsiteTagNested(
              input: {
                websiteTag: {
                  websiteByUniqueUrl: {
                    url: "https://example.com/path/index.html"
                  }
                  tagByUniqueNameAndLanguage: {
                    name: "Fun"
                    languageByUniqueIsoCode: { isoCode: "Does not exist" }
                  }
                }
              }
            ) {
              websiteTag {
                id
              }
            }

            second: createWebsiteTagNested(
              input: {
                websiteTag: {
                  websiteByUniqueUrl: { url: "https://thebestplacetocode.dev/" }
                  tagByUniqueNameAndLanguage: {
                    name: "Does not exist"
                    languageByUniqueName: { name: "Polish" }
                  }
                }
              }
            ) {
              websiteTag {
                id
              }
            }
          }
        `,
        asAdmin(),
      );

      expect(result).toMatchSnapshot();
    });

    it('should fail on ambiguous nested inputs', async () => {
      const result = await testGraphql(
        gql`
          mutation createWebsiteTagNested {
            createWebsiteTagNested(
              input: {
                websiteTag: {
                  websiteByUniqueUrl: {
                    url: "https://example.com/path/index.html"
                  }
                  tagByUniqueNameAndLanguage: {
                    name: "Fun"
                    languageByUniqueIsoCode: { isoCode: "en" }
                    languageByUniqueName: { name: "English" }
                  }
                }
              }
            ) {
              websiteTag {
                id
              }
            }
          }
        `,
        asAdmin(),
      );

      expect(result).toMatchSnapshot();
    });
  });

  describe('query', () => {
    it('should resolve computed values', async () => {
      const result = await testGraphql(
        gql`
          query allWebsites {
            allWebsites {
              totalCount
              edges {
                node {
                  id
                  url
                  category
                  isSecure
                  createdBy
                  profileByCreatedBy {
                    id
                    username
                  }
                }
              }
            }
          }
        `,
        asAdmin(),
      );

      expect(result).toMatchSnapshot();
    });

    it('should deep resolve edges on the graph', async () => {
      const result = await testGraphql(
        gql`
          query allBoardMembers {
            allBoardMembers(first: 3) {
              edges {
                node {
                  id
                  inviter
                  invitee
                  board
                  boardByBoard {
                    id
                    name
                    boardMembersByBoard(
                      orderBy: [BOARD_ASC, INVITEE_ASC]
                      first: 4
                    ) {
                      totalCount
                      edges {
                        node {
                          profileByInvitee {
                            id
                            username
                            boardsByOwner {
                              totalCount
                              edges {
                                node {
                                  name
                                  owner
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        asAdmin(),
      );

      expect(result).toMatchSnapshot();
    });
  });
});
