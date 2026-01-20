/**
 * Google Reader Revenue Manager (Newsletter/Subscriptions)
 * Product ID: CAowuYrEDA:openaccess
 */
(self.SWG_BASIC = self.SWG_BASIC || []).push(basicSubscriptions => {
    basicSubscriptions.init({
        type: "NewsArticle",
        isPartOfType: ["Product"],
        isPartOfProductId: "CAowuYrEDA:openaccess",
        clientOptions: { theme: "light", lang: "en" },
    });
});
