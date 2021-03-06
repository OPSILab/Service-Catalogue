
package it.eng.opsi.servicecatalog.model;

import java.util.ArrayList;
import java.util.List;
import javax.validation.Valid;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "identifier",
    "title",
    "description",
    "type",
    "related"
})
public class IsGroupedBy {

    @JsonProperty("identifier")
    private String identifier;
    /**
     * name
     * <p>
     * 
     * 
     */
    @JsonProperty("title")
    private String title;
    @JsonProperty("description")
    @Valid
    private Description__1 description;
    @JsonProperty("type")
    @Valid
    private List<String> type = new ArrayList<String>();
    /**
     * relatedService
     * <p>
     * 
     * 
     */
    @JsonProperty("related")
    private String related;

    /**
     * No args constructor for use in serialization
     * 
     */
    public IsGroupedBy() {
    }

    /**
     * 
     * @param identifier
     * @param related
     * @param description
     * @param title
     * @param type
     */
    public IsGroupedBy(String identifier, String title, Description__1 description, List<String> type, String related) {
        super();
        this.identifier = identifier;
        this.title = title;
        this.description = description;
        this.type = type;
        this.related = related;
    }

    @JsonProperty("identifier")
    public String getIdentifier() {
        return identifier;
    }

    @JsonProperty("identifier")
    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    /**
     * name
     * <p>
     * 
     * 
     */
    @JsonProperty("title")
    public String getTitle() {
        return title;
    }

    /**
     * name
     * <p>
     * 
     * 
     */
    @JsonProperty("title")
    public void setTitle(String title) {
        this.title = title;
    }

    @JsonProperty("description")
    public Description__1 getDescription() {
        return description;
    }

    @JsonProperty("description")
    public void setDescription(Description__1 description) {
        this.description = description;
    }

    @JsonProperty("type")
    public List<String> getType() {
        return type;
    }

    @JsonProperty("type")
    public void setType(List<String> type) {
        this.type = type;
    }

    /**
     * relatedService
     * <p>
     * 
     * 
     */
    @JsonProperty("related")
    public String getRelated() {
        return related;
    }

    /**
     * relatedService
     * <p>
     * 
     * 
     */
    @JsonProperty("related")
    public void setRelated(String related) {
        this.related = related;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(IsGroupedBy.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("identifier");
        sb.append('=');
        sb.append(((this.identifier == null)?"<null>":this.identifier));
        sb.append(',');
        sb.append("title");
        sb.append('=');
        sb.append(((this.title == null)?"<null>":this.title));
        sb.append(',');
        sb.append("description");
        sb.append('=');
        sb.append(((this.description == null)?"<null>":this.description));
        sb.append(',');
        sb.append("type");
        sb.append('=');
        sb.append(((this.type == null)?"<null>":this.type));
        sb.append(',');
        sb.append("related");
        sb.append('=');
        sb.append(((this.related == null)?"<null>":this.related));
        sb.append(',');
        if (sb.charAt((sb.length()- 1)) == ',') {
            sb.setCharAt((sb.length()- 1), ']');
        } else {
            sb.append(']');
        }
        return sb.toString();
    }

    @Override
    public int hashCode() {
        int result = 1;
        result = ((result* 31)+((this.identifier == null)? 0 :this.identifier.hashCode()));
        result = ((result* 31)+((this.description == null)? 0 :this.description.hashCode()));
        result = ((result* 31)+((this.title == null)? 0 :this.title.hashCode()));
        result = ((result* 31)+((this.type == null)? 0 :this.type.hashCode()));
        result = ((result* 31)+((this.related == null)? 0 :this.related.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof IsGroupedBy) == false) {
            return false;
        }
        IsGroupedBy rhs = ((IsGroupedBy) other);
        return ((((((this.identifier == rhs.identifier)||((this.identifier!= null)&&this.identifier.equals(rhs.identifier)))&&((this.description == rhs.description)||((this.description!= null)&&this.description.equals(rhs.description))))&&((this.title == rhs.title)||((this.title!= null)&&this.title.equals(rhs.title))))&&((this.type == rhs.type)||((this.type!= null)&&this.type.equals(rhs.type))))&&((this.related == rhs.related)||((this.related!= null)&&this.related.equals(rhs.related))));
    }

}
