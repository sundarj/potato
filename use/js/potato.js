(function (window, document, _, $, Backbone) {
    
    var Photos = Backbone.Collection.extend({
        url: 'https://api.flickr.com/services/feeds/photos_public.gne?tags=potato&tagmode=all&format=json&jsoncallback=?',
        parse: function (feed) {
            return feed.items
        }
    });
    
    var PhotoFeed = new Photos;
    
    var MainView = Backbone.View.extend({
        el: $('main'),
        
        render: function () {
            PhotoFeed.each(function (model) {
                var photo = new PhotoView({
                    model: model
                });
                $(this.el).append(photo.render().el);
            }.bind(this));
        },
        
        initialize: function () {
            _.bindAll(this, 'render');
            var self = this;
            PhotoFeed.fetch({
                success: function () {
                    self.render();
                }
            });
        }
    });
    
    function formatAsDate(iso) {
        var date = new Date(iso);
        
        var day = date.getUTCDate() + '';
        switch (day.charAt(day.length - 1)) {
            case '1':
                day += 'st';
                break;
            case '2':
                day += 'nd';
                break;
            case '3':
                day += 'rd';
                break;
            default:
                day += 'th';
                break;
        }
        
        var months = [
            'Jan', 'Feb', 'Mar', 'Apr',
            'May', 'Jun', 'Jul', 'Aug',
            'Sep', 'Oct', 'Nov', 'Dec'
        ];
        
        var month = months[date.getUTCMonth()];
        
        var year = date.getUTCFullYear();
        
        var time = [date.getHours(), date.getMinutes()].map(function (unit) {
            return unit < 10? '0' + unit : unit;
        }).join(':');
        
        return [day, month, year, 'at', time].join(" ");
        
    }
    
    function renderTags(tags) {
        return tags.split(" ").map(function (tag) {
            return '<a href="https://flickr.com/photos/tag/TAG/">TAG</a>'.replace(/TAG/g, tag);
        }).join(" ");
    }
    
    function renderAttributes(attrs) {
        attrs.tags = 'Tags: ' + renderTags(attrs.tags);
        attrs.published = 'Published: ' + formatAsDate(attrs.published);
        return attrs;
    }
    
    var PhotoView = Backbone.View.extend({
        tagName: 'section',
        className: 'feed-item list-view',
        
        template: _.template($('#feed-item-template').html()),
        
        render: function () {
            this.model.attributes = renderAttributes(this.model.attributes);
            $(this.el).html(this.template(this.model.attributes));
            return this;
        },
        
        events: {
            "click .feed-image": "singleView",
            "click .back-btn": "listView"
        },
        
        singleView: function () {
            $('body').addClass('single-open');
            
            var current = $(this.el);
            current.removeClass('list-view').addClass('single-view');
            
            current
                .find('.feed-title')
                .wrap(current
                    .find('.item-link a')
                    .text(''));
                    
            current.find('.feed-author a').text('Photo author');
        },
        
        listView: function () {
            $('body').removeClass('single-open');
            
            var current = $(this.el);
            current.removeClass('single-view').addClass('list-view');
            
            var title = current.find('.feed-title');
            var link = title.parent();
            
            title.prependTo(current.find('.feed-content'));
            link.text('View on Flickr').appendTo(current.find('.item-link'));
            
        }
    });
    
    var app = new MainView;
    
})(window, document, _, jQuery, Backbone);