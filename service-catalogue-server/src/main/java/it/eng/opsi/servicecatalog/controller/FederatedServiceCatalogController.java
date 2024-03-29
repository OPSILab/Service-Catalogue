package it.eng.opsi.servicecatalog.controller;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity.HeadersBuilder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import it.eng.opsi.servicecatalog.exception.CatalogueNotFoundException;
import it.eng.opsi.servicecatalog.exception.ServiceNotFoundException;
import it.eng.opsi.servicecatalog.model.Catalogue;
import it.eng.opsi.servicecatalog.service.IServiceCatalogService;
import lombok.extern.slf4j.Slf4j;

/*
@OpenAPIDefinition(info = @Info(title = "Service Catalog API", description = "Service Catalog APIs used to manage CRUD for Federated query descriptions.", version = "1.0"), tags = {
		@Tag(name = "Federated query", description = "Federated query Description APIs to get and manage Federated query descriptions.") })
*/
@RestController
@RequestMapping("/api/v2/federated")
@Slf4j
public class FederatedServiceCatalogController implements FederatedIServiceCatalogController {

	@Autowired
	IServiceCatalogService catalogService;

	@Autowired
	IServiceCatalogController catalogController;

	@Value("${uriBasePath}")
	private String uriBasePath;

	@Override
	@Operation(summary = "Get all the Federated Federated query descriptions.", description = "Get all the Federated Federated query descriptions saved in the Service Catalog.", tags = {
			"Federated query" }, responses = {
					@ApiResponse(description = "Returns the list of all federated Federated query descriptions.", responseCode = "200") })
	@GetMapping(value = "/services", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> getServices(@RequestParam(required = false) String name,
			@RequestParam(required = false) String location, @RequestParam(required = false) String[] keywords,
			@RequestParam(required = true) String remoteCatalogueID)
			throws ServiceNotFoundException, URISyntaxException {

		boolean completed = true;

		if (name != null || location != null || keywords != null) {

			String stringifiedParams = "?";

			if (completed)
				stringifiedParams = stringifiedParams.concat("completed=".concat("true"));

			if (name != null)
				stringifiedParams = stringifiedParams
						.concat(completed ? "&name=".concat(java.net.URLEncoder.encode(name, StandardCharsets.UTF_8))
								: "name=".concat(java.net.URLEncoder.encode(name, StandardCharsets.UTF_8)));

			if (location != null)
				stringifiedParams = stringifiedParams
						.concat(name != null || completed
								? "&".concat("location="
										.concat(java.net.URLEncoder.encode(location, StandardCharsets.UTF_8)))
								: "location".concat(java.net.URLEncoder.encode(location, StandardCharsets.UTF_8)));

			if (keywords != null) {
				String keywordsStringified = name != null || completed || location != null ? "&" : "";
				for (String keyword : keywords)
					keywordsStringified = keywordsStringified.concat("keywords=")
							.concat(java.net.URLEncoder.encode(keyword, StandardCharsets.UTF_8)).concat("&");
				stringifiedParams = stringifiedParams.concat(keywordsStringified);
			}

			return ResponseEntity
					.ok(catalogService.getFederatedServices(remoteCatalogueID, keywords == null ? stringifiedParams
							: stringifiedParams.substring(0, stringifiedParams.length() - 1)));
		}

		return ResponseEntity.ok(catalogService.getFederatedServices(remoteCatalogueID, "?completed=true"));
	}

	@Override
	@Operation(summary = "Get the Federated query description by Service Id.", description = "Get the Federated query description by Service Id.", tags = {
			"Federated query" }, responses = {
					@ApiResponse(description = "Returns the requested Federated query description.", responseCode = "200") })
	@GetMapping(value = "/services/json/**", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> getServiceById(@RequestParam("identifier") String identifier,
			@RequestParam("remoteCatalogueID") String remoteCatalogueID)
			throws ServiceNotFoundException, IOException, URISyntaxException {
		return ResponseEntity
				.ok(catalogService.getFederatedServices(remoteCatalogueID,
						"/json?identifier=".concat(java.net.URLEncoder.encode(identifier, StandardCharsets.UTF_8))));
	}

	@Operation(summary = "Get Service Cost  by serviceId. ", tags = {
			"Federated query" }, responses = {
					@ApiResponse(description = "Get Service Cost records  by serviceId.", responseCode = "200") })
	@Override
	@GetMapping(value = "/services/cost", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> getServiceCost(@RequestParam("serviceId") String serviceId,
			@RequestParam("remoteCatalogueID") String remoteCatalogueID)
			throws ServiceNotFoundException, IOException, URISyntaxException {

		return ResponseEntity
				.ok(catalogService.getFederatedServices(remoteCatalogueID,
						"/cost?serviceId=".concat(java.net.URLEncoder.encode(serviceId, StandardCharsets.UTF_8))));
	}

	public HeadersBuilder<?> NotFound() {
		return ResponseEntity.notFound();
	}

	@Operation(summary = "Get Service time  by serviceId.", tags = {
			"Federated query" }, responses = {
					@ApiResponse(description = "The (estimated) time needed for executing a Public Service using the ISO8601 syntax for durations: P(n)Y(n)M(n)DT(n)H(n)M(n)S).", responseCode = "200") })
	@Override
	@GetMapping(value = "/services/time", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> getServiceTime(@RequestParam("remoteCatalogueID") String remoteCatalogueID,
			@RequestParam("serviceId") String serviceId)
			throws ServiceNotFoundException, IOException, URISyntaxException {

		return ResponseEntity
				.ok(catalogService.getFederatedServices(remoteCatalogueID,
						"/time?serviceId=".concat(java.net.URLEncoder.encode(serviceId, StandardCharsets.UTF_8))));
	}

	@Override
	@Operation(summary = "Get the Federated query descriptions by specified Service Ids.", description = "Get the Federated query descriptions by specified Service Id.", tags = {
			"Federated query" }, responses = {
					@ApiResponse(description = "Returns the requested Federated query descriptions.", responseCode = "200") })
	@GetMapping(value = "/services/specified/**", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> getServiceByIds(HttpServletRequest request,
			@RequestParam("remoteCatalogueID") String remoteCatalogueID,
			@RequestParam("identifier") List<String> identifiers)
			throws ServiceNotFoundException, IOException, URISyntaxException {
		String identifiersStringified = "";
		for (String identifier : identifiers)
			identifiersStringified = identifiersStringified.concat("identifier=")
					.concat(java.net.URLEncoder.encode(identifier, StandardCharsets.UTF_8)).concat("&");
		return ResponseEntity
				.ok(catalogService.getFederatedServices(remoteCatalogueID, "/specified?"
						.concat(identifiersStringified.substring(0, identifiersStringified.length() - 1))));
	}

	@Override
	@Operation(summary = "Get the Federated query descriptions by specified Service Location.", description = "Get the Federated query descriptions by specified Service Location.", tags = {
			"Federated query" }, responses = {
					@ApiResponse(description = "Returns the requested Federated query descriptions.", responseCode = "200") })
	@GetMapping(value = "/services/specified/location", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> getServiceByLocation(HttpServletRequest request,
			@RequestParam("remoteCatalogueID") String remoteCatalogueID, @RequestParam("location") String location)
			throws ServiceNotFoundException, IOException, URISyntaxException {

		return ResponseEntity
				.ok(catalogService.getFederatedServices(remoteCatalogueID,
						"/specified/location?location="
								.concat(java.net.URLEncoder.encode(location, StandardCharsets.UTF_8))));

	}

	@Override
	@Operation(summary = "Get the Federated query descriptions by specified Service Keywords.", description = "Get the Federated query descriptions by specified Service Keywords.", tags = {
			"Federated query" }, responses = {
					@ApiResponse(description = "Returns the requested Federated query descriptions.", responseCode = "200") })
	@GetMapping(value = "/services/specified/keyword", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> getServiceByKeywords(HttpServletRequest request,
			@RequestParam("remoteCatalogueID") String remoteCatalogueID, @RequestParam("keywords") String[] keywords)
			throws ServiceNotFoundException, IOException, URISyntaxException {
		String keywordsStringified = "?";

		for (String keyword : keywords)
			keywordsStringified = keywordsStringified.concat("keywords=")
					.concat(java.net.URLEncoder.encode(keyword, StandardCharsets.UTF_8))// keyword.replaceAll(" ",
																						// "%20"))
					.concat("&");

		return ResponseEntity
				.ok(catalogService.getFederatedServices(remoteCatalogueID, "/specified/keyword"
						.concat(keywordsStringified.substring(0, keywordsStringified.length() - 1))));

	}

	@Override
	@Operation(summary = "Get the Federated query descriptions by specified Service Title.", description = "Get the Federated query descriptions by specified Service Title.", tags = {
			"Federated query" }, responses = {
					@ApiResponse(description = "Returns the requested Federated query descriptions.", responseCode = "200") })
	@GetMapping(value = "/services/specified/title", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> getServiceByTitle(HttpServletRequest request,
			@RequestParam("remoteCatalogueID") String remoteCatalogueID, @RequestParam("title") String title)
			throws ServiceNotFoundException, IOException, URISyntaxException {

		return ResponseEntity
				.ok(catalogService.getFederatedServices(remoteCatalogueID,
						"/specified/title?title=".concat(java.net.URLEncoder.encode(title, StandardCharsets.UTF_8))));

	}

	@Override
	@Operation(summary = "Get the Federated query descriptions is handling personal data", description = "Get the Federated query descriptions is handling personal data.", tags = {
			"Federated query" }, responses = {
					@ApiResponse(description = "Returns the requested Federated query descriptions.", responseCode = "200") })
	@GetMapping(value = "/services/isPersonalDataHandling", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> getServiceIsPersonalDataHandling(
			@RequestParam("remoteCatalogueID") String remoteCatalogueID, HttpServletRequest request)
			throws ServiceNotFoundException, IOException, URISyntaxException {

		return ResponseEntity
				.ok(catalogService.getFederatedServices(remoteCatalogueID, "/isPersonalDataHandling"));

	}

	@Override
	@Operation(summary = "Get the count of the  Federated query descriptions is personal data handling.", tags = {
			"Federated query" }, responses = {
					@ApiResponse(description = "Returns the count.", responseCode = "200") })
	@GetMapping(value = "/services/isPersonalDataHandling/count", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> getServicesIsPersonalDataHandlingCount(
			@RequestParam("remoteCatalogueID") String remoteCatalogueID)
			throws ServiceNotFoundException, URISyntaxException {

		return ResponseEntity
				.ok(catalogService.getFederatedServices(remoteCatalogueID, "/isPersonalDataHandling/count"));
	}

	@Override
	@Operation(summary = "Get the Federated querys count grouped by Sector.", description = "Get the Federated querys count grouped by Sector.", tags = {
			"Federated query" }, responses = {
					@ApiResponse(description = "Return an object with count for each sector.", responseCode = "200") })
	@GetMapping(value = "/services/count/sector", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> getCountBySector(@RequestParam("remoteCatalogueID") String remoteCatalogueID)
			throws ServiceNotFoundException, URISyntaxException {

		return ResponseEntity
				.ok(catalogService.getFederatedServices(remoteCatalogueID, "/count/sector"));
	}

	@Override
	@Operation(summary = "Get the count of the Service model descriptions (total, public and private services).", tags = {
			"Service model" }, responses = { @ApiResponse(description = "Returns the count.", responseCode = "200") })
	@GetMapping(value = "/services/count", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> getServicesCount(@RequestParam("remoteCatalogueID") String remoteCatalogueID)
			throws ServiceNotFoundException, URISyntaxException {

		return ResponseEntity
				.ok(catalogService.getFederatedServicesCount(remoteCatalogueID, "/api/v2/services/count"));
	}

	@Override
	@Operation(summary = "Get the Federated querys count grouped by Thematic Area.", description = "Get the Federated querys count grouped by Thematic Area.", tags = {
			"Federated query" }, responses = {
					@ApiResponse(description = "Return an object with count for each sector.", responseCode = "200") })
	@GetMapping(value = "/services/count/thematicArea", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> getCountByThematicArea(@RequestParam("remoteCatalogueID") String remoteCatalogueID)
			throws ServiceNotFoundException, URISyntaxException {

		return ResponseEntity
				.ok(catalogService.getFederatedServices(remoteCatalogueID, "/count/thematicArea"));
	}

	@Override
	@Operation(summary = "Get the Federated querys count grouped by GroupedBy.", description = "Get the Federated querys count grouped by GroupedBy.", tags = {
			"Federated query" }, responses = {
					@ApiResponse(description = "Return an object with count for each sector.", responseCode = "200") })
	@GetMapping(value = "/services/count/groupedBy", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> getCountByGroupedBy(@RequestParam("remoteCatalogueID") String remoteCatalogueID)
			throws ServiceNotFoundException, URISyntaxException {

		return ResponseEntity
				.ok(catalogService.getFederatedServices(remoteCatalogueID, "/count/groupedBy"));
	}

	@Override
	@Operation(summary = "Get the Federated querys count grouped by Spatial.", description = "Get the Federated querys count grouped by Spatial.", tags = {
			"Federated query" }, responses = {
					@ApiResponse(description = "Return an object with count for each location.", responseCode = "200") })
	@GetMapping(value = "/services/count/location", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> getCountByLocation(@RequestParam("remoteCatalogueID") String remoteCatalogueID)
			throws ServiceNotFoundException, URISyntaxException {

		return ResponseEntity
				.ok(catalogService.getFederatedServices(remoteCatalogueID, "/count/location"));
	}

	@Override
	@Operation(summary = "Get Service catalogue's status.", description = "Get Service catalogue's status.", tags = {
			"Status" }, responses = {
					@ApiResponse(description = "Returns the Service catalogue's status.", responseCode = "200") })
	@GetMapping(value = "/status", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> getStatus(@RequestParam(required = false) String catalogueID,
			@RequestParam(required = false) String URL) {
		if (catalogueID != null)
			return ResponseEntity.ok(catalogService.getFederatedStatus(catalogueID));
		return ResponseEntity.ok(catalogService.getFederatedStatusByURL(URL));
	}

	@Override
	@Operation(summary = "Get all the catalogue descriptions.", description = "Get all the catalogue descriptions saved in the Service Catalog.", tags = {
			"Catalogue model" }, responses = {
					@ApiResponse(description = "Returns the list of all registered catalogue descriptions.", responseCode = "200") })
	@GetMapping(value = "/catalogues/public", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<?> getCatalogues(@RequestParam("URL") String URL)
			throws CatalogueNotFoundException {
		return ResponseEntity.ok(catalogService.getRemoteCatalogues(URL));
	}
}