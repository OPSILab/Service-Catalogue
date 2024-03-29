package it.eng.opsi.servicecatalog.repository;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;

import it.eng.opsi.servicecatalog.model.Adapter;

public class AdapterCustomRepositoryImpl implements AdapterCustomRepository {

	@Autowired
	MongoTemplate template;

	public Optional<Adapter> updateAdapter(String adapterId, Adapter adapter) {

		Adapter updatedAdapter = template.findAndReplace(query(where("adapterId").is(adapterId)),
				adapter);

		return Optional.ofNullable(updatedAdapter);

	}

	@Override
	public Adapter deleteAdapter(String adapterId) {

		template.findAllAndRemove(query(where("adapterId").is(adapterId)), adapterId);
		return null;
	}
}