import axios from 'axios';
import NodeCache from 'node-cache';
import https from 'https';
import http from 'http';

const generateUrlPosted = (id = null) => `https://api.x.com/graphql/xBtHv5-Xsk268T5ng_OGNg/TweetResultByRestId?variables={"tweetId":"${id}","withCommunity":false,"includePromotedContent":false,"withVoice":false}&features={"creator_subscriptions_tweet_preview_api_enabled":true,"c9s_tweet_anatomy_moderator_badge_enabled":true,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"rweb_video_timestamps_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_enhance_cards_enabled":false}&fieldToggles={"withArticleRichContentState":true}`;

const generateUrlProfile = (id = null, count = null) => /^\d+$/.test(id) ? `https://api.x.com/graphql/WwS-a6hAhqAAe-gItelmHA/UserTweets?variables={"userId":"${id}","count":${count},"includePromotedContent":true,"withQuickPromoteEligibilityTweetFields":true,"withVoice":true,"withV2Timeline":true}&features={"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"c9s_tweet_anatomy_moderator_badge_enabled":true,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"rweb_video_timestamps_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_enhance_cards_enabled":false}` : `https://api.x.com/graphql/k5XapwcSikNsEsILW5FvgA/UserByScreenName?variables={"screen_name":"${id.toLowerCase()}","withSafetyModeUserFields":true}&features={"hidden_profile_likes_enabled":true,"hidden_profile_subscriptions_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"subscriptions_verification_info_is_identity_verified_enabled":true,"subscriptions_verification_info_verified_since_enabled":true,"highlights_tweets_tab_ui_enabled":true,"responsive_web_twitter_article_notes_tab_enabled":true,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true}&fieldToggles={"withAuxiliaryUserLabels":false}`;

class Twitter {
    #cache;
    #Instance;
    #input;
    constructor(input = null) {
        this.#input = input;
        this.#cache = new NodeCache({
            deleteOnExpire: true
        });
        this.#Instance = axios.create({
            httpsAgent: new https.Agent({
                keepAlive: true,
                rejectUnauthorized: false
            }),
            httpAgent: new http.Agent({
                keepAlive: true
            }),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
                'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                'DNT': '1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'id,en-US;q=0.9,en;q=0.8'
            }
        });

        this.#Instance.interceptors.response.use((response) => ({
            error: false,
            statusText: response.statusText,
            config: response.config,
            headers: response.headers,
            link: response.request.res?.responseUrl || response.config.url,
            status: response.status,
            data: response.data
        }), (error) => {
            if (error.response) {
                return Promise.reject({
                    error: true,
                    status: error.response.status,
                    data: error.response.data?.errors?.[0]
                });
            }
            return Promise.reject({
                error: true,
                message: error.message
            });
        });
    }

    setArgument(input = null) {
        if (!this.#input) {
            this.#input = input;
            return this;
        }
    }

    #parseCount(value, label) {
        return `${new Intl.NumberFormat('id-ID').format(value || 0).replace(/,/g, '.')} ${label}`;
    }

    #utcFormat(duration) {
        return [Math.floor(duration / 3600), Math.floor((duration % 3600) / 60), Math.floor(duration % 60)]
            .filter((v, i) => v > 0 || i > 0)
            .map((v) => String(v).padStart(2, '0'))
            .join(':');
    }

    #bestQuality(array = []) {
        return array
            .filter((item) => item.content_type === 'video/mp4')
            .sort((a, b) => Number(b.bitrate || 0) - Number(a.bitrate || 0))[0] || {};
    }

    #sortData(data = null) {
        const sortedData = data.reduce((object, result) => {
            if (result.type === 'photo') object.photos.push(result);
            if (result.type === 'video') object.videos.push(result);
            return object;
        }, {
            photos: [],
            videos: []
        });
        return [...sortedData.photos, ...sortedData.videos];
    }

    async #getGuestToken(token = null) {
        const response = await fetch('https://api.twitter.com/1.1/guest/activate.json', {
            method: 'POST',
            body: '',
            headers: {
                authorization: `Bearer ${token}`
            },
        });
        const {
            guest_token
        } = await response.json();
        return guest_token;
    }

    async #getToken() {
        try {
            const scriptContent = await fetch('https://abs.twimg.com/responsive-web/client-web/main.f849712a.js').then((response) => response.text());
            const tokenBearer = scriptContent.match(/AAAAAAAAAAAAAAAAAAAAA\w+[a-zA-Z0-9%-_.\/\\]+/)[0];
            const tokenGuest = await this.#getGuestToken(tokenBearer);
            return {
                tokenGuest,
                tokenBearer
            };
        } catch (error) {
            throw error;
        }
    }

    #extractMetadataAuthor(metadata) {
        return {
            id: metadata.rest_id,
            verified: metadata.legacy.verified,
            username: metadata.legacy.name.trim(),
            nickname: metadata.legacy.screen_name.trim(),
            location: metadata.legacy.location.trim(),
            description: metadata.legacy.description.trim(),
            favourites_count: this.#parseCount(metadata.legacy.favourites_count, 'Favourites'),
            followers_count: this.#parseCount(metadata.legacy.followers_count, 'Followers'),
            followings_count: this.#parseCount(metadata.legacy.friends_count, 'Followings'),
            media_count: this.#parseCount(metadata.legacy.media_count, 'Media'),
            status_count: this.#parseCount(metadata.legacy.statuses_count, 'Status'),
            pinned_tweet: metadata.legacy.pinned_tweet_ids_str.length !== 0 ? metadata.legacy.pinned_tweet_ids_str.map((id) => `https://x.com/${metadata.legacy.screen_name}/status/${id}`) : [],
            profile_url: metadata.legacy.profile_image_url_https,
            banner_url: metadata.legacy.profile_banner_url,
        }
    }

    async download(link = this.#input) {
        try {
            const tweetId = link.match(/\/(\d+)/i)[1];
            const generateUrl = generateUrlPosted(tweetId);
            const token = await this.#getToken();
            const response = await this.#Instance.get(encodeURI(generateUrl), {
                headers: {
                    authorization: `Bearer ${token.tokenBearer}`,
                    'x-guest-token': token.tokenGuest,
                },
            })
            const {
                data
            } = response.data;
            if (!data.tweetResult.hasOwnProperty('result')) return {
                status: false,
                message: 'Result empty.'
            };
            const userMetadata = data.tweetResult.result.core.user_results.result;
            const mediaMetadata = data.tweetResult.result;
            const mediaEntities = mediaMetadata.legacy?.extended_entities?.media ||
                mediaMetadata.quoted_status_result?.result?.legacy?.extended_entities?.media;

            if (!mediaEntities) {
                return {
                    status: false,
                    message: 'No media found in either path.'
                };
            }

            const result = {
                author: this.#extractMetadataAuthor(userMetadata),
                caption: mediaMetadata.legacy?.full_text || '-',
                bookmark_count: this.#parseCount(mediaMetadata.legacy?.bookmark_count, 'Bookmark'),
                favorite_count: this.#parseCount(mediaMetadata.legacy?.favorite_count, 'Favourites'),
                comment_count: this.#parseCount(mediaMetadata.legacy?.quote_count, 'Comments'),
                reply_count: this.#parseCount(mediaMetadata.legacy?.reply_count, 'Reply'),
                retweet_count: this.#parseCount(mediaMetadata.legacy?.retweet_count, 'Retweets'),
                views_count: this.#parseCount(
                    mediaMetadata.views?.count ||
                    mediaMetadata.legacy?.extended_entities?.media[0]?.mediaStats?.viewCount ||
                    mediaMetadata.quoted_status_result?.result?.legacy?.extended_entities?.media[0]?.mediaStats?.viewCount,
                    'Views'
                ),
                data: mediaEntities.map((media) => {
                    if (media.type === 'photo') {
                        return {
                            type: media.type,
                            content_type: 'image/jpg',
                            url: media.media_url_https,
                        };
                    } else {
                        const video = this.#bestQuality(media.video_info.variants);
                        return {
                            type: media.type,
                            duration: this.#utcFormat(+media.video_info.duration_millis / 1000),
                            thumbnail: media.media_url_https,
                            ...video
                        };
                    }
                })
            };
            return result;
        } catch (error) {
            console.error(error);
            return {
                status: false,
                message: error.message
            };
        }
    }
    async getPostUser(username = this.#input) {
        try {
            username = username.startsWith('@') ? username.slice(1) : username;
            const token = await this.#getToken();
            const keys = `post-${username}`;
            if (this.#cache.has(keys)) {
                const result = this.#cache.get(keys);
                return typeof result === 'object' ? result : JSON.parse(result);
            }
            const dataUser = await this.stalker(username);
            const url = generateUrlProfile(dataUser.id, +dataUser.status_count.replace(/[^0-9]/g, ''));
            const response = await fetch(encodeURI(url), {
                method: 'GET',
                headers: {
                    'authorization': `Bearer ${token.tokenBearer}`,
                    'x-guest-token': token.tokenGuest
                }
            }).then((response) => response.json());
            console.log(response);
            const result = {};
            Object.assign(result, dataUser);
            const data = response.data.user.result.timeline_v2.timeline.instructions.filter((item) => item.type === 'TimelineAddEntries')[0].entries.filter((item) => item.content.entryType === 'TimelineTimelineItem').filter((item) => item.content.itemContent.tweet_results.result.legacy.extended_entities).map((item) => {
                return item.content.itemContent.tweet_results.result.legacy.extended_entities.media.map((element) => {
                    let response = {};
                    if (element.type === 'photo') {
                        response.type = element.type;
                        response.content_type = 'image/jpg';
                        response.url = element.media_url_https;
                    } else {
                        const videoUrl = this.#bestQuality(element.video_info.variants);
                        response.type = element.type;
                        response.duration = this.#utcFormat(element.video_info.duration_millis / 1000);
                        response.thumbnail = element.media_url_https;
                        response = {
                            ...response,
                            ...videoUrl
                        };
                    }
                    return response;
                })[0];
            });
            result.data = this.#sortData(data);
            this.#cache.set(keys, JSON.stringify(result));
            result.data = result.data;
            return result;
        } catch (error) {
            throw error;
        }
    }
    async stalker(username = this.#input) {
        try {
            username = username.startsWith('@') ? username.slice(1) : username;
            if (this.#cache.has(username)) {
                const result = this.#cache.get(username);
                return typeof result === 'object' ? result : JSON.parse(result);
            }
            const token = await this.#getToken();
            const url = generateUrlProfile(username);
            const dataJson = await this.#Instance.get(encodeURI(url), {
                method: 'GET',
                headers: {
                    'authorization': `Bearer ${token.tokenBearer}`,
                    'x-guest-token': token.tokenGuest
                }
            });
            if (dataJson.data.errors) return {
                status: false,
                message: dataJson.data.errors[0].message
            };
            const result = this.#extractMetadataAuthor(dataJson.data.data.user.result);
            this.#cache.set(username, JSON.stringify(result));
            return result;
        } catch (error) {
            throw error;
        }
    }
}

export default Twitter;
