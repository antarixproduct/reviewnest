export const isValidReviewLink = (url: string) => {
  const pattern = /^https:\/\/g\.page\/r\/[A-Za-z0-9_-]+\/review$/;
  return pattern.test(url.trim());
};

export const isValidPlaceReviewLink = (url: string, placeId?: string) => {
  if (!placeId) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.origin === 'https://search.google.com' &&
      parsed.pathname === '/local/writereview' &&
      parsed.searchParams.get('placeid') === placeId;
  } catch {
    return false;
  }
};

export const isAcceptedReviewLink = (url: string, placeId?: string) => (
  isValidReviewLink(url) || isValidPlaceReviewLink(url, placeId)
);

export const GOOGLE_REVIEW_LINK_PLACEHOLDER = 'https://g.page/r/your-unique-id/review';
export const GOOGLE_REVIEW_LINK_ERROR = 'Please enter a valid Google review link. It should look like: https://g.page/r/.../review';
