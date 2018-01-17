cc.Class({
    extends: cc.Component,

    properties: {
        returnBtn: {
                default: null,
                type: cc.Button
            },
    },

    createList: function() {
        for (var i = 0; i < this.rankCount; ++i) {
            var playerInfo = players[i];
            var item = cc.instantiate(this.prefabRankItem);
            item.getComponent('RankItem').init(i, playerInfo);
            this.content.addChild(item);
        }
    },

    clickReturnBtn: function () {
        cc.director.loadScene('load');
    },

    // use this for initialization
    onLoad: function () {
    },

    // called every frame
    update: function (dt) {
    },
});
